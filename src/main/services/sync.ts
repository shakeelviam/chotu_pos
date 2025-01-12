import { getDatabase } from '../database';
import { getERPNextService } from './erpnext';
import { Item, Customer, POSInvoice } from '@/types';

export class SyncService {
  private static instance: SyncService;
  private db = getDatabase();

  private constructor() {}

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  async queueForSync(entityType: string, entityId: number, action: string) {
    const stmt = this.db.prepare(`
      INSERT INTO sync_queue (entity_type, entity_id, action, status)
      VALUES (?, ?, ?, 'pending')
    `);
    return stmt.run(entityType, entityId, action);
  }

  async processSyncQueue() {
    const erpnext = await getERPNextService();

    const pendingItems = this.db.prepare(`
      SELECT * FROM sync_queue
      WHERE status = 'pending'
      ORDER BY priority DESC, created_at ASC
      LIMIT 50
    `).all();

    for (const item of pendingItems) {
      try {
        let success = false;

        this.db.prepare(`
          UPDATE sync_queue
          SET attempts = attempts + 1,
              last_attempt = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(item.id);

        switch (item.entity_type) {
          case 'sale':
            success = await this.syncSale(item.entity_id);
            break;
          case 'customer':
            success = await this.syncCustomer(item.entity_id);
            break;
          case 'item':
            success = await this.syncItem(item.entity_id);
            break;
        }

        if (success) {
          this.db.prepare(`
            DELETE FROM sync_queue WHERE id = ?
          `).run(item.id);

          this.updateSyncStatus(item.entity_type, null);
        } else {
          if (item.attempts >= 3) {
            this.db.prepare(`
              UPDATE sync_queue
              SET status = 'failed',
                  error_message = 'Maximum attempts reached'
              WHERE id = ?
            `).run(item.id);
          }
        }
      } catch (error: any) {
        this.updateSyncStatus(item.entity_type, error.message);
      }
    }
  }

  private async syncSale(saleId: number): Promise<boolean> {
    try {
      const erpnext = await getERPNextService();

      const sale = this.db.prepare(`
        SELECT * FROM sales WHERE id = ?
      `).get(saleId);

      const items = this.db.prepare(`
        SELECT * FROM sale_items WHERE sale_id = ?
      `).all(saleId);

      const now = new Date().toISOString();
      const [datePart, timePart] = now.split('T');

      const invoice: POSInvoice = {
        posting_date: datePart,
        posting_time: timePart.split('.')[0],
        customer: sale.customer_id,
        total: sale.total_amount,
        grand_total: sale.total_amount,
        net_total: sale.total_amount,
        status: sale.status,
        pos_profile: "Default POS Profile",
        company: "Your Company",
        warehouse: "Stores - TC",
        currency: "KWD",
        created_at: sale.created_at || now,
        updated_at: now,
        items: items.map(item => ({
          item_code: item.item_code,
          item_name: item.item_name,
          standard_rate: item.rate,
          rate: item.rate,
          quantity: item.quantity,
          discount_percentage: 0,
          discount_amount: 0,
          amount: item.amount,
          uom: "Nos",
          conversion_factor: 1,
          has_batch_no: false,
          has_serial_no: false,
          allow_rate_change: true
        })),
        payments: [{
          mode_of_payment: sale.payment_method,
          amount: sale.total_amount
        }]
      };

      const result = await erpnext.syncInvoice(invoice);

      if (result.success) {
        this.db.prepare(`
          UPDATE sales SET synced = 1 WHERE id = ?
        `).run(saleId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error syncing sale:', error);
      return false;
    }
  }

  private async syncCustomer(customerId: number): Promise<boolean> {
    try {
      const erpnext = await getERPNextService();
      const customer = this.db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);

      if (!customer) return false;

      await erpnext.syncCustomers();

      this.db.prepare(`
        UPDATE customers SET synced = 1 WHERE id = ?
      `).run(customerId);

      return true;
    } catch (error) {
      console.error('Error syncing customer:', error);
      return false;
    }
  }

  private async syncItem(itemId: number): Promise<boolean> {
    try {
      const erpnext = await getERPNextService();
      const item = this.db.prepare('SELECT * FROM items WHERE item_code = ?').get(itemId);

      if (!item) return false;

      await erpnext.syncItems();

      this.db.prepare(`
        UPDATE items SET synced = 1 WHERE item_code = ?
      `).run(itemId);

      return true;
    } catch (error) {
      console.error('Error syncing item:', error);
      return false;
    }
  }

  private async updateSyncStatus(entityType: string, errorMessage: string | null) {
    this.db.prepare(`
      INSERT INTO sync_status (entity_type, last_sync_time, last_sync_status, error_message)
      VALUES (?, CURRENT_TIMESTAMP, ?, ?)
      ON CONFLICT(entity_type) DO UPDATE SET
        last_sync_time = CURRENT_TIMESTAMP,
        last_sync_status = ?,
        error_message = ?,
        updated_at = CURRENT_TIMESTAMP
    `).run(
      entityType,
      errorMessage ? 'error' : 'success',
      errorMessage,
      errorMessage ? 'error' : 'success',
      errorMessage
    );
  }

  async getSyncStatus() {
    return this.db.prepare(`
      SELECT entity_type, last_sync_time, last_sync_status, error_message
      FROM sync_status
      ORDER BY last_sync_time DESC
    `).all();
  }

  async getPendingSyncCount() {
    return this.db.prepare(`
      SELECT entity_type, COUNT(*) as count
      FROM sync_queue
      WHERE status = 'pending'
      GROUP BY entity_type
    `).all();
  }
}

export function getSyncService(): SyncService {
  return SyncService.getInstance();
}