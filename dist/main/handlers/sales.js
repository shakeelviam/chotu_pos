"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSalesHandlers = registerSalesHandlers;
const electron_1 = require("electron");
const database_1 = require("../database");
const mockErpnext_1 = require("../services/mockErpnext");
const erpnextService = new mockErpnext_1.MockERPNextService();
function registerSalesHandlers() {
    electron_1.ipcMain.handle('sales:create', async (_event, data) => {
        const db = (0, database_1.getDatabase)();
        try {
            const saleData = typeof data === 'string' ? JSON.parse(data) : data;
            return db.transaction(() => {
                const paymentMethod = saleData.payment.payments?.[0]?.method || saleData.payment.method;
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
        `).run(saleData.customer_id, saleData.total_amount, paymentMethod, paymentDetails, 'completed');
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
                    insertItem.run(lastInsertRowid, item.item_code, item.item_name, item.quantity, item.rate, item.amount, item.discount || null, item.discountType || null, item.original_amount || item.amount);
                }
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
        }
        catch (error) {
            console.error('Error creating sale:', error);
            throw new Error('Failed to create sale: ' + error.message);
        }
    });
    electron_1.ipcMain.handle('sales:get', () => {
        const db = (0, database_1.getDatabase)();
        try {
            const sales = db.prepare(`
        SELECT 
          s.*,
          c.name as customer_name,
          c.mobile as customer_mobile
        FROM sales s
        LEFT JOIN customers c ON c.id = s.customer_id
        ORDER BY s.created_at DESC
      `).all();
            const salesWithItems = sales.map(sale => {
                const items = db.prepare(`
          SELECT * FROM sale_items WHERE sale_id = ?
        `).all(sale.id);
                const completeSale = {
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
        }
        catch (error) {
            console.error('Failed to get sales:', error);
            return {
                success: false,
                error: 'Failed to get sales'
            };
        }
    });
    electron_1.ipcMain.handle('sales:sync', async () => {
        const db = (0, database_1.getDatabase)();
        try {
            const unsyncedSales = db.prepare(`
        SELECT * FROM sales WHERE synced = false
      `).all();
            for (const sale of unsyncedSales) {
                try {
                    const items = db.prepare(`
            SELECT * FROM sale_items WHERE sale_id = ?
          `).all(sale.id);
                    const completeSale = {
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
                    await erpnextService.createSale(completeSale);
                    db.prepare(`
            UPDATE sales SET synced = true WHERE id = ?
          `).run(sale.id);
                }
                catch (error) {
                    console.error(`Error syncing sale ${sale.id}:`, error);
                }
            }
            return { success: true };
        }
        catch (error) {
            console.error('Error syncing sales:', error);
            return { success: false, error: 'Failed to sync sales' };
        }
    });
}
//# sourceMappingURL=sales.js.map