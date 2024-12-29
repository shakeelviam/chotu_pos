"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerInventoryHandlers = registerInventoryHandlers;
const electron_1 = require("electron");
const database_1 = require("../database");
const mockErpnext_1 = require("../services/mockErpnext");
const erpnextService = new mockErpnext_1.MockERPNextService();
function registerInventoryHandlers() {
    electron_1.ipcMain.handle('inventory:sync', async () => {
        try {
            const { items } = await erpnextService.getItems();
            if (items) {
                const db = (0, database_1.getDatabase)();
                const stmt = db.prepare(`
          INSERT OR REPLACE INTO items (
            item_code, item_name, description, barcode, 
            standard_rate, current_stock, last_sync
          ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);
                db.transaction(() => {
                    for (const item of items) {
                        stmt.run(item.item_code, item.item_name, item.description, item.barcode, item.standard_rate, item.current_stock);
                    }
                })();
                return { success: true, message: 'Inventory synced successfully' };
            }
            return { success: false, error: 'Failed to sync inventory' };
        }
        catch (error) {
            console.error('Inventory sync error:', error);
            return {
                success: false,
                error: 'Failed to sync inventory'
            };
        }
    });
    electron_1.ipcMain.handle('inventory:getItems', async () => {
        try {
            const db = (0, database_1.getDatabase)();
            const items = db.prepare('SELECT * FROM items').all();
            return {
                success: true,
                items
            };
        }
        catch (error) {
            console.error('Failed to get items:', error);
            return {
                success: false,
                error: 'Failed to get items'
            };
        }
    });
    electron_1.ipcMain.handle('inventory:search', async (_event, query) => {
        try {
            const db = (0, database_1.getDatabase)();
            const items = db.prepare(`
        SELECT * FROM items 
        WHERE item_code LIKE ? 
        OR item_name LIKE ? 
        OR barcode LIKE ?
      `).all(`%${query}%`, `%${query}%`, `%${query}%`);
            return {
                success: true,
                items
            };
        }
        catch (error) {
            console.error('Search items error:', error);
            return {
                success: false,
                error: 'Failed to search items'
            };
        }
    });
}
//# sourceMappingURL=inventory.js.map