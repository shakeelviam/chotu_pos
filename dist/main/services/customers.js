"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const better_sqlite3_1 = require("better-sqlite3");
const electron_1 = require("electron");
const path = require("path");
class CustomerService {
    constructor() {
        const dbPath = path.join(electron_1.app.getPath('userData'), 'customers.db');
        this.db = new better_sqlite3_1.default(dbPath);
        this.initializeDatabase();
    }
    initializeDatabase() {
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
    async searchCustomers(query) {
        try {
            const stmt = this.db.prepare(`
        SELECT * FROM customers
        WHERE mobile LIKE ? OR name LIKE ?
        ORDER BY name ASC
        LIMIT 10
      `);
            const searchPattern = `%${query}%`;
            return stmt.all(searchPattern, searchPattern);
        }
        catch (error) {
            console.error('Failed to search customers:', error);
            throw error;
        }
    }
    async getCustomerByMobile(mobile) {
        try {
            const stmt = this.db.prepare('SELECT * FROM customers WHERE mobile = ?');
            return stmt.get(mobile);
        }
        catch (error) {
            console.error('Failed to get customer:', error);
            throw error;
        }
    }
    async createCustomer(customer) {
        try {
            const now = new Date().toISOString();
            const stmt = this.db.prepare(`
        INSERT INTO customers (name, mobile, erpnext_id, synced, created_at, updated_at)
        VALUES (?, ?, ?, 0, ?, ?)
      `);
            const result = stmt.run(customer.name, customer.mobile, customer.erpnext_id || null, now, now);
            return {
                id: result.lastInsertRowid,
                ...customer,
                synced: false,
                created_at: now,
                updated_at: now
            };
        }
        catch (error) {
            console.error('Failed to create customer:', error);
            throw error;
        }
    }
    async updateCustomer(id, updates) {
        try {
            const now = new Date().toISOString();
            const customer = this.db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
            if (!customer) {
                throw new Error('Customer not found');
            }
            const stmt = this.db.prepare(`
        UPDATE customers
        SET name = ?, mobile = ?, synced = 0, updated_at = ?
        WHERE id = ?
      `);
            stmt.run(updates.name || customer.name, updates.mobile || customer.mobile, now, id);
            return {
                ...customer,
                ...updates,
                synced: false,
                updated_at: now
            };
        }
        catch (error) {
            console.error('Failed to update customer:', error);
            throw error;
        }
    }
    async getUnSyncedCustomers() {
        try {
            const stmt = this.db.prepare('SELECT * FROM customers WHERE synced = 0');
            return stmt.all();
        }
        catch (error) {
            console.error('Failed to get unsynced customers:', error);
            throw error;
        }
    }
    async markAsSynced(id, erpnextId) {
        try {
            const stmt = this.db.prepare(`
        UPDATE customers
        SET synced = 1, erpnext_id = ?, updated_at = ?
        WHERE id = ?
      `);
            stmt.run(erpnextId, new Date().toISOString(), id);
        }
        catch (error) {
            console.error('Failed to mark customer as synced:', error);
            throw error;
        }
    }
    async syncWithERPNext(erpnext) {
        try {
            const response = await erpnext.syncCustomers();
            const customers = response;
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
            const batch = this.db.transaction((customers) => {
                for (const customer of customers) {
                    if (customer.mobile_no) {
                        stmt.run(customer.customer_name, customer.mobile_no, customer.name, now, now);
                    }
                }
            });
            batch(customers);
            const unsyncedCustomers = await this.getUnSyncedCustomers();
            for (const customer of unsyncedCustomers) {
                try {
                    const customerData = {
                        doctype: 'Customer',
                        customer_name: customer.name,
                        customer_type: 'Individual',
                        customer_group: 'Individual',
                        territory: 'All Territories',
                        mobile_no: customer.mobile
                    };
                    const result = await erpnext.getAxiosInstance().post('/api/resource/Customer', customerData);
                    await this.markAsSynced(customer.id, result.data.data.name);
                }
                catch (error) {
                    console.error(`Failed to sync customer ${customer.id}:`, error);
                }
            }
            return { success: true };
        }
        catch (error) {
            console.error('Failed to sync customers:', error);
            throw error;
        }
    }
    async getDefaultCustomer(erpnext) {
        try {
            const posProfile = erpnext.getCurrentPOSProfile();
            if (!posProfile?.customer) {
                return null;
            }
            const response = await erpnext.getAxiosInstance().get(`/api/resource/Customer/${posProfile.customer}`);
            const customer = response.data.data;
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
            return stmt.get(customer.customer_name, customer.mobile_no, customer.name, now, now);
        }
        catch (error) {
            console.error('Failed to get default customer:', error);
            throw error;
        }
    }
}
exports.CustomerService = CustomerService;
//# sourceMappingURL=customers.js.map