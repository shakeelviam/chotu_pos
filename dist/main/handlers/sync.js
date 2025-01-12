"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSyncHandlers = registerSyncHandlers;
const electron_1 = require("electron");
const database_1 = require("../database");
const erpnext_1 = require("../services/erpnext");
function registerSyncHandlers() {
    electron_1.ipcMain.handle('sync:all', async () => {
        const db = (0, database_1.getDatabase)();
        const erpnext = await (0, erpnext_1.getERPNextService)();
        try {
            const status = {
                last_sync: new Date().toISOString(),
                items_synced: false,
                customers_synced: false,
                sales_synced: false
            };
            try {
                const items = await erpnext.syncItems();
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
                const insertMany = db.transaction((items) => {
                    for (const item of items) {
                        insertItem.run(item.item_code, item.item_name, item.description, item.standard_rate, item.current_stock, item.barcode);
                    }
                });
                insertMany(items);
                status.items_synced = true;
            }
            catch (error) {
                console.error('Error syncing items:', error);
            }
            try {
                const customers = await erpnext.syncCustomers();
                db.prepare('DELETE FROM customers').run();
                const insertCustomer = db.prepare(`
          INSERT INTO customers (
            name,
            mobile,
            created_at,
            synced
          ) VALUES (?, ?, datetime('now'), 1)
        `);
                const insertMany = db.transaction((customers) => {
                    for (const customer of customers) {
                        insertCustomer.run(customer.name, customer.mobile);
                    }
                });
                insertMany(customers);
                status.customers_synced = true;
            }
            catch (error) {
                console.error('Error syncing customers:', error);
            }
            try {
                const unsyncedSales = db.prepare(`
          SELECT * FROM sales WHERE synced = 0
        `).all();
                for (const sale of unsyncedSales) {
                    try {
                        const saleItems = db.prepare(`
              SELECT * FROM sale_items WHERE sale_id = ?
            `).all(sale.id);
                        const result = await erpnext.syncInvoice({
                            ...sale,
                            items: saleItems,
                            posting_date: new Date(sale.created_at).toISOString().split('T')[0],
                            posting_time: new Date(sale.created_at).toISOString().split('T')[1]
                        });
                        if (result.success) {
                            db.prepare(`
                UPDATE sales SET synced = 1 WHERE id = ?
              `).run(sale.id);
                        }
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
            db.prepare(`
        UPDATE sync_status
        SET last_sync = datetime('now'),
            items_synced = ?,
            customers_synced = ?,
            sales_synced = ?
        WHERE id = 1
      `).run(status.items_synced ? 1 : 0, status.customers_synced ? 1 : 0, status.sales_synced ? 1 : 0);
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
        const db = (0, database_1.getDatabase)();
        try {
            const status = db.prepare(`
        SELECT * FROM sync_status WHERE id = 1
      `).get();
            const pendingSync = db.prepare(`
        SELECT
          COUNT(CASE WHEN synced = 0 THEN 1 END) as pending_sales
        FROM sales
      `).get();
            return {
                success: true,
                status: {
                    last_sync: status.last_sync,
                    items_synced: Boolean(status.items_synced),
                    customers_synced: Boolean(status.customers_synced),
                    sales_synced: Boolean(status.sales_synced),
                    pending_sales: pendingSync.pending_sales
                }
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