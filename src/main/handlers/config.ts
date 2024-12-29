import { ipcMain } from 'electron';
import { ERPNextService } from '../services/erpnext';
import { getConfig, saveConfig } from '../services/config';

export function registerConfigHandlers() {
  ipcMain.handle('config:get', async () => {
    try {
      const config = await getConfig();
      return { success: true, config };
    } catch (error: any) {
      console.error('Failed to get config:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('config:save', async (_, config: { url: string; api_key: string; api_secret: string }) => {
    try {
      await saveConfig(config);
      
      // Test connection and sync data
      try {
        const erpnext = await ERPNextService.initialize();
        await erpnext.syncAll();
        return { success: true };
      } catch (error: any) {
        // Revert config if connection fails
        await saveConfig({ url: '', api_key: '', api_secret: '' });
        throw error;
      }
    } catch (error: any) {
      console.error('Failed to save config:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to save configuration' 
      };
    }
  });
}
