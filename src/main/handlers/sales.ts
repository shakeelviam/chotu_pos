import { ipcMain } from 'electron';
import { getDatabase } from '../database';
import { MockERPNextService } from '../services/mockErpnext';
import { Sale, Payment, SplitPayment, PaymentMethod, PaymentStatus } from '@/shared/types';

const erpnextService = new MockERPNextService();

interface SaleItem {
  item_code: string;
  item_name: string;
  quantity: number;
  rate: number;
  amount: number;
  discount?: number;
  discountType?: 'amount' | 'percentage';
  original_amount?: number;
}

interface SaleData {
  customer_id: number;
  total_amount: number;
  items: SaleItem[];
  payment: {
    method: PaymentMethod;
    amount: number;
    payments?: Array<{
      method: PaymentMethod;
      amount: number;
      approval_code?: string;
      reference?: string;
    }>;
    approval_code?: string;
    reference?: string;
  };
}

interface DBSale {
  id: number;
  customer_id: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_details: string;
  status: PaymentStatus;
  synced: boolean;
  created_at: string;
  customer_name: string;
  customer_mobile: string;
}

export function registerSalesHandlers() {
  // Create a new sale
  ipcMain.handle('sales:create', async (_event, data: any) => {
    const db = getDatabase();
    
    try {
      // Parse the stringified data if needed
      const saleData: SaleData = typeof data === 'string' ? JSON.parse(data) : data;
      
      return db.transaction(() => {
        // For split payments, use the first payment method as the main one
        const paymentMethod = saleData.payment.payments?.[0]?.method || saleData.payment.method;

        // Serialize payment details and ensure it's a clean object
        const paymentDetails = JSON.stringify({
          method: saleData.payment.method,
          amount: saleData.payment.amount,
          payments: saleData.payment.payments?.map(p => ({
            method: p.method,
            amount: p.amount,
            approval_code: p.approval_code,
            reference: p.reference
          })),
          approval_code: saleData.payment.approval_code,
          reference: saleData.payment.reference
        });

        // Insert sale record
        const { lastInsertRowid } = db.prepare(`
          INSERT INTO sales (
            customer_id, 
            total_amount, 
            payment_method, 
            payment_details,
            status,
            synced,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, false, datetime('now'))
        `).run(
          saleData.customer_id,
          saleData.total_amount,
          paymentMethod,
          paymentDetails,
          'completed'
        );

        // Insert sale items
        const insertItem = db.prepare(`
          INSERT INTO sale_items (
            sale_id,
            item_code,
            item_name,
            quantity,
            rate,
            amount,
            discount,
            discount_type,
            original_amount
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const item of saleData.items) {
          insertItem.run(
            lastInsertRowid,
            item.item_code,
            item.item_name,
            item.quantity,
            item.rate,
            item.amount,
            item.discount || null,
            item.discountType || null,
            item.original_amount || item.amount
          );
        }

        // Get the created sale with all details
        const sale = db.prepare(`
          SELECT 
            s.*,
            c.name as customer_name,
            c.mobile as customer_mobile
          FROM sales s
          LEFT JOIN customers c ON c.id = s.customer_id
          WHERE s.id = ?
        `).get(lastInsertRowid);

        const items = db.prepare(`
          SELECT * FROM sale_items WHERE sale_id = ?
        `).all(lastInsertRowid);

        return {
          ...sale,
          items,
          payment_details: JSON.parse(sale.payment_details)
        };
      });
    } catch (error) {
      console.error('Error creating sale:', error);
      throw new Error('Failed to create sale: ' + error.message);
    }
  });

  // Get all sales
  ipcMain.handle('sales:get', () => {
    const db = getDatabase();
    try {
      const sales = db.prepare(`
        SELECT 
          s.*,
          c.name as customer_name,
          c.mobile as customer_mobile
        FROM sales s
        LEFT JOIN customers c ON c.id = s.customer_id
        ORDER BY s.created_at DESC
      `).all() as DBSale[];

      // Get items for each sale
      const salesWithItems = sales.map(sale => {
        const items = db.prepare(`
          SELECT * FROM sale_items WHERE sale_id = ?
        `).all(sale.id);

        const completeSale: Sale = {
          id: sale.id.toString(),
          customer_id: sale.customer_id,
          total_amount: sale.total_amount,
          payment: JSON.parse(sale.payment_details),
          status: sale.status,
          created_at: sale.created_at,
          items: items.map(item => ({
            item_code: item.item_code,
            item_name: item.item_name,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            discount: item.discount,
            discountType: item.discount_type,
            original_amount: item.original_amount
          }))
        };

        return completeSale;
      });

      return {
        success: true,
        sales: salesWithItems
      };
    } catch (error) {
      console.error('Failed to get sales:', error);
      return {
        success: false,
        error: 'Failed to get sales'
      };
    }
  });

  // Sync sales with ERPNext
  ipcMain.handle('sales:sync', async () => {
    const db = getDatabase();
    try {
      // Get unsynced sales
      const unsyncedSales = db.prepare(`
        SELECT * FROM sales WHERE synced = false
      `).all() as DBSale[];

      // Sync each sale
      for (const sale of unsyncedSales) {
        try {
          // Get sale items
          const items = db.prepare(`
            SELECT * FROM sale_items WHERE sale_id = ?
          `).all(sale.id);

          const completeSale: Sale = {
            id: sale.id.toString(),
            customer_id: sale.customer_id,
            total_amount: sale.total_amount,
            payment: JSON.parse(sale.payment_details),
            status: sale.status,
            created_at: sale.created_at,
            items: items.map(item => ({
              item_code: item.item_code,
              item_name: item.item_name,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.amount,
              discount: item.discount,
              discountType: item.discount_type,
              original_amount: item.original_amount
            }))
          };

          // Sync to ERPNext
          await erpnextService.createSale(completeSale);

          // Mark as synced
          db.prepare(`
            UPDATE sales SET synced = true WHERE id = ?
          `).run(sale.id);
        } catch (error) {
          console.error(`Error syncing sale ${sale.id}:`, error);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error syncing sales:', error);
      return { success: false, error: 'Failed to sync sales' };
    }
  });
}
