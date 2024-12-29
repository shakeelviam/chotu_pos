import { ipcMain } from 'electron';
import { getDatabase } from '../database';
import { MockERPNextService } from '../services/mockErpnext';

const erpnextService = new MockERPNextService();

export function registerInventoryHandlers() {
  ipcMain.handle('inventory:sync', async () => {
    try {
      const { items } = await erpnextService.getItems();
      if (items) {
        const db = getDatabase();
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO items (
            item_code, item_name, description, barcode, 
            standard_rate, current_stock, last_sync
          ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);

        db.transaction(() => {
          for (const item of items) {
            stmt.run(
              item.item_code,
              item.item_name,
              item.description,
              item.barcode,
              item.standard_rate,
              item.current_stock
            );
          }
        })();

        return { success: true, message: 'Inventory synced successfully' };
      }
      return { success: false, error: 'Failed to sync inventory' };
    } catch (error) {
      console.error('Inventory sync error:', error);
      return {
        success: false,
        error: 'Failed to sync inventory'
      };
    }
  });

  ipcMain.handle('inventory:getItems', async () => {
    try {
      const db = getDatabase();
      const items = db.prepare('SELECT * FROM items').all();
      return {
        success: true,
        items
      };
    } catch (error) {
      console.error('Failed to get items:', error);
      return {
        success: false,
        error: 'Failed to get items'
      };
    }
  });

  ipcMain.handle('inventory:search', async (_event, query) => {
    try {
      const db = getDatabase();
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
    } catch (error) {
      console.error('Search items error:', error);
      return {
        success: false,
        error: 'Failed to search items'
      };
    }
  });
}
