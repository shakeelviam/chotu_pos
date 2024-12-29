import Database from 'better-sqlite3';
import { app } from 'electron';
import * as path from 'path';
import { ERPNextService } from './erpnext';
import { Customer, ERPNextCustomer } from '@/types';

export class CustomerService {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(app.getPath('userData'), 'customers.db');
    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        mobile TEXT NOT NULL,
        erpnext_id TEXT,
        synced BOOLEAN DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(mobile)
      );
      CREATE INDEX IF NOT EXISTS idx_mobile ON customers(mobile);
      CREATE INDEX IF NOT EXISTS idx_erpnext_id ON customers(erpnext_id);
    `);
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM customers 
        WHERE mobile LIKE ? OR name LIKE ?
        ORDER BY name ASC
        LIMIT 10
      `);
      const searchPattern = `%${query}%`;
      return stmt.all(searchPattern, searchPattern) as Customer[];
    } catch (error) {
      console.error('Failed to search customers:', error);
      throw error;
    }
  }

  async getCustomerByMobile(mobile: string): Promise<Customer | undefined> {
    try {
      const stmt = this.db.prepare('SELECT * FROM customers WHERE mobile = ?');
      return stmt.get(mobile) as Customer | undefined;
    } catch (error) {
      console.error('Failed to get customer:', error);
      throw error;
    }
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'synced'>): Promise<Customer> {
    try {
      const now = new Date().toISOString();
      const stmt = this.db.prepare(`
        INSERT INTO customers (name, mobile, erpnext_id, synced, created_at, updated_at)
        VALUES (?, ?, ?, 0, ?, ?)
      `);
      
      const result = stmt.run(
        customer.name,
        customer.mobile,
        customer.erpnext_id || null,
        now,
        now
      );

      return {
        id: result.lastInsertRowid as number,
        ...customer,
        synced: false,
        created_at: now,
        updated_at: now
      };
    } catch (error) {
      console.error('Failed to create customer:', error);
      throw error;
    }
  }

  async updateCustomer(id: number, updates: Partial<Customer>): Promise<Customer> {
    try {
      const now = new Date().toISOString();
      const customer = this.db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as Customer;
      if (!customer) {
        throw new Error('Customer not found');
      }

      const stmt = this.db.prepare(`
        UPDATE customers 
        SET name = ?, mobile = ?, synced = 0, updated_at = ?
        WHERE id = ?
      `);

      stmt.run(
        updates.name || customer.name,
        updates.mobile || customer.mobile,
        now,
        id
      );

      return {
        ...customer,
        ...updates,
        synced: false,
        updated_at: now
      };
    } catch (error) {
      console.error('Failed to update customer:', error);
      throw error;
    }
  }

  async getUnSyncedCustomers(): Promise<Customer[]> {
    try {
      const stmt = this.db.prepare('SELECT * FROM customers WHERE synced = 0');
      return stmt.all() as Customer[];
    } catch (error) {
      console.error('Failed to get unsynced customers:', error);
      throw error;
    }
  }

  async markAsSynced(id: number, erpnextId: string): Promise<void> {
    try {
      const stmt = this.db.prepare(`
        UPDATE customers 
        SET synced = 1, erpnext_id = ?, updated_at = ?
        WHERE id = ?
      `);
      stmt.run(erpnextId, new Date().toISOString(), id);
    } catch (error) {
      console.error('Failed to mark customer as synced:', error);
      throw error;
    }
  }

  async syncWithERPNext(erpnext: ERPNextService): Promise<{ success: boolean }> {
    try {
      // 1. Get all customers from ERPNext
      const response = await erpnext.getAxiosInstance().get('/api/resource/Customer', {
        params: {
          fields: JSON.stringify(['name', 'customer_name', 'mobile_no']),
          limit_page_length: 1000
        }
      });

      // 2. Update local database with ERPNext customers
      const stmt = this.db.prepare(`
        INSERT INTO customers (name, mobile, erpnext_id, synced, created_at, updated_at)
        VALUES (?, ?, ?, 1, ?, ?)
        ON CONFLICT(mobile) DO UPDATE SET
        name = excluded.name,
        erpnext_id = excluded.erpnext_id,
        synced = 1,
        updated_at = excluded.updated_at
      `);

      const now = new Date().toISOString();
      const batch = this.db.transaction((customers: ERPNextCustomer[]) => {
        for (const customer of customers) {
          if (customer.mobile_no) { // Only sync customers with mobile numbers
            stmt.run(
              customer.customer_name,
              customer.mobile_no,
              customer.name,
              now,
              now
            );
          }
        }
      });

      batch(response.data.data);

      // 3. Sync local unsynced customers to ERPNext
      const unsyncedCustomers = await this.getUnSyncedCustomers();
      for (const customer of unsyncedCustomers) {
        try {
          const customerData = {
            doctype: 'Customer',
            customer_name: customer.name,
            customer_type: 'Individual',
            customer_group: 'Individual', // You might want to make this configurable
            territory: 'All Territories', // You might want to make this configurable
            mobile_no: customer.mobile
          };

          const result = await erpnext.getAxiosInstance().post('/api/resource/Customer', customerData);
          await this.markAsSynced(customer.id!, result.data.data.name);
        } catch (error) {
          console.error(`Failed to sync customer ${customer.id}:`, error);
          // Continue with next customer even if one fails
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to sync customers:', error);
      throw error;
    }
  }

  async getDefaultCustomer(erpnext: ERPNextService): Promise<Customer | null> {
    try {
      const posProfile = erpnext.getCurrentPOSProfile();
      if (!posProfile?.customer) {
        return null;
      }

      // Get customer details from ERPNext
      const response = await erpnext.getAxiosInstance().get(`/api/resource/Customer/${posProfile.customer}`);
      const customer = response.data.data as ERPNextCustomer;

      // Make sure this customer is in our local DB
      const stmt = this.db.prepare(`
        INSERT INTO customers (name, mobile, erpnext_id, synced, created_at, updated_at)
        VALUES (?, ?, ?, 1, ?, ?)
        ON CONFLICT(mobile) DO UPDATE SET
        name = excluded.name,
        erpnext_id = excluded.erpnext_id,
        synced = 1,
        updated_at = excluded.updated_at
        RETURNING *
      `);

      const now = new Date().toISOString();
      return stmt.get(
        customer.customer_name,
        customer.mobile_no,
        customer.name,
        now,
        now
      ) as Customer;
    } catch (error) {
      console.error('Failed to get default customer:', error);
      throw error;
    }
  }
}
