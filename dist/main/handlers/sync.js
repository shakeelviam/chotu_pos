"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSyncHandlers = registerSyncHandlers;
const electron_1 = require("electron");
const database_1 = require("../database");
const mockErpnext_1 = require("../services/mockErpnext");
const erpnextService = new mockErpnext_1.MockERPNextService();
function registerSyncHandlers() {
    electron_1.ipcMain.handle('sync:all', async () => {
        const db = (0, database_1.getDatabase)();
        try {
            const status = {
                last_sync: new Date().toISOString(),
                items_synced: false,
                customers_synced: false,
                sales_synced: false
            };
            try {
                const { items } = await erpnextService.getItems();
                db.prepare('DELETE FROM items').run();
                const insertItem = db.prepare(`
          INSERT INTO items (
            item_code, 
            item_name, 
            description, 
            standard_rate, 
            current_stock,
            barcode
          ) VALUES (?, ?, ?, ?, ?, ?)
        `);
                for (const item of items) {
                    insertItem.run(item.item_code, item.item_name, item.description, item.standard_rate, item.current_stock, item.barcode);
                }
                status.items_synced = true;
            }
            catch (error) {
                console.error('Error syncing items:', error);
            }
            try {
                const customers = await erpnextService.getCustomers();
                db.prepare('DELETE FROM customers').run();
                const insertCustomer = db.prepare(`
          INSERT INTO customers (
            id,
            name, 
            mobile
          ) VALUES (?, ?, ?)
        `);
                for (const customer of customers) {
                    insertCustomer.run(customer.id, customer.name, customer.mobile);
                }
                status.customers_synced = true;
            }
            catch (error) {
                console.error('Error syncing customers:', error);
            }
            try {
                const unsyncedSales = db.prepare(`
          SELECT * FROM sales WHERE synced = false
        `).all();
                for (const sale of unsyncedSales) {
                    try {
                        const items = db.prepare(`
              SELECT * FROM sale_items WHERE sale_id = ?
            `).all(sale.id);
                        const saleData = {
                            id: sale.id,
                            customer_id: sale.customer_id,
                            total_amount: sale.total_amount,
                            payment_details: JSON.parse(sale.payment_details),
                            status: sale.status,
                            created_at: sale.created_at,
                            items: items
                        };
                        await erpnextService.syncSales([saleData]);
                        db.prepare(`
              UPDATE sales SET synced = true WHERE id = ?
            `).run(sale.id);
                    }
                    catch (error) {
                        console.error(`Error syncing sale ${sale.id}:`, error);
                    }
                }
                status.sales_synced = true;
            }
            catch (error) {
                console.error('Error syncing sales:', error);
            }
            return {
                success: true,
                status
            };
        }
        catch (error) {
            console.error('Sync failed:', error);
            return {
                success: false,
                error: 'Sync failed'
            };
        }
    });
    electron_1.ipcMain.handle('sync:status', async () => {
        try {
            const pendingSync = await erpnextService.checkSyncStatus();
            return {
                success: true,
                ...pendingSync
            };
        }
        catch (error) {
            console.error('Failed to get sync status:', error);
            return {
                success: false,
                error: 'Failed to get sync status'
            };
        }
    });
}
//# sourceMappingURL=sync.js.map