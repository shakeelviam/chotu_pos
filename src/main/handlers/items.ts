import { ipcMain } from 'electron';
import { MockERPNextService } from '../services/mockErpnext';

const erpnextService = new MockERPNextService();

export function registerItemHandlers() {
  console.log('Registering items handlers...');
  
  // Get all items
  ipcMain.handle('items:getAll', async (): Promise<any> => {
    console.log('items:getAll handler called');
    try {
      const { items } = await erpnextService.getItems();
      return { success: true, items };
    } catch (error: any) {
      console.error('Failed to get items:', error);
      return { success: false, error: error.message || 'Failed to fetch items' };
    }
  });

  // Search items
  ipcMain.handle('items:search', async (_, query: string): Promise<any> => {
    console.log('items:search handler called with query:', query);
    try {
      const { items } = await erpnextService.getItems();
      const searchQuery = query.toLowerCase();
      
      const filteredItems = items.filter(item => 
        item.item_code.toLowerCase().includes(searchQuery) ||
        item.item_name.toLowerCase().includes(searchQuery) ||
        item.barcode?.toLowerCase().includes(searchQuery)
      );

      return { success: true, items: filteredItems };
    } catch (error: any) {
      console.error('Failed to search items:', error);
      return { success: false, error: error.message || 'Failed to search items' };
    }
  });

  console.log('Items handlers registered successfully');
}
