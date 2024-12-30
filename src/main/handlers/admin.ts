import { ipcMain } from 'electron';
import { getDatabase } from '../services/database';
import { Config } from '../services/config';
import { getERPNextService } from '../services/erpnext';

export function registerAdminHandlers() {
  const db = getDatabase();
  const config = Config.getInstance();

  // Test ERPNext connection
  ipcMain.handle('admin:test-connection', async () => {
    try {
      const erpnextService = await getERPNextService();
      const result = await erpnextService.testConnection();
      return result;
    } catch (error) {
      console.error('Failed to test connection:', error);
      return { success: false, error: error.message };
    }
  });

  // Get ERPNext config
  ipcMain.handle('admin:get-erpnext-config', async () => {
    try {
      const conf = await config.get();
      return { success: true, config: conf };
    } catch (error) {
      console.error('Failed to get ERPNext config:', error);
      return { success: false, error: error.message };
    }
  });

  // Save ERPNext config
  ipcMain.handle('admin:save-erpnext-config', async (_, data) => {
    try {
      await config.set(data);
      return { success: true };
    } catch (error) {
      console.error('Failed to save ERPNext config:', error);
      return { success: false, error: error.message };
    }
  });

  // Get POS profiles
  ipcMain.handle('admin:get-pos-profiles', async () => {
    try {
      const erpnextService = await getERPNextService();
      const profiles = await erpnextService.getPOSProfiles();
      return { success: true, profiles };
    } catch (error) {
      console.error('Failed to get POS profiles:', error);
      return { success: false, error: error.message };
    }
  });

  // Get role configs
  ipcMain.handle('admin:get-role-configs', async () => {
    try {
      const stmt = db.prepare('SELECT * FROM role_configs ORDER BY created_at DESC');
      const configs = stmt.all();
      return { success: true, configs };
    } catch (error) {
      console.error('Failed to get role configs:', error);
      return { success: false, error: error.message };
    }
  });

  // Save role config
  ipcMain.handle('admin:save-role-config', async (_, data) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO role_configs (role, pos_profile, max_discount_percent, max_discount_amount)
        VALUES (@role, @pos_profile, @max_discount_percent, @max_discount_amount)
        ON CONFLICT(role) DO UPDATE SET
          pos_profile = @pos_profile,
          max_discount_percent = @max_discount_percent,
          max_discount_amount = @max_discount_amount,
          updated_at = CURRENT_TIMESTAMP
      `);
      stmt.run(data);
      return { success: true };
    } catch (error) {
      console.error('Failed to save role config:', error);
      return { success: false, error: error.message };
    }
  });

  // Delete role config
  ipcMain.handle('admin:delete-role-config', async (_, role) => {
    try {
      const stmt = db.prepare('DELETE FROM role_configs WHERE role = ?');
      stmt.run(role);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete role config:', error);
      return { success: false, error: error.message };
    }
  });

  // Get user configurations
  ipcMain.handle('admin:get-user-configs', async () => {
    try {
      const stmt = db.prepare('SELECT * FROM user_configs ORDER BY created_at DESC');
      const configs = stmt.all();
      return { success: true, users: configs };
    } catch (error) {
      console.error('Failed to get user configs:', error);
      return { success: false, error: error.message };
    }
  });

  // Save single user configuration
  ipcMain.handle('admin:save-user-config', async (_, config: any) => {
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO user_configs (user_id, pos_profile, max_discount_percent, created_at)
        VALUES (@userId, @posProfile, @maxDiscountPercent, datetime('now'))
      `);
      stmt.run(config);
      return { success: true };
    } catch (error) {
      console.error('Failed to save user config:', error);
      return { success: false, error: error.message };
    }
  });

  // Save multiple user configurations (from template)
  ipcMain.handle('admin:save-user-configs', async (_, configs: any[]) => {
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO user_configs (user_id, pos_profile, max_discount_percent, created_at)
        VALUES (@userId, @posProfile, @maxDiscountPercent, datetime('now'))
      `);
      
      db.transaction(() => {
        for (const config of configs) {
          stmt.run(config);
        }
      })();
      
      return { success: true };
    } catch (error) {
      console.error('Failed to save user configs:', error);
      return { success: false, error: error.message };
    }
  });

  // Delete user configuration
  ipcMain.handle('admin:delete-user-config', async (_, userId: string) => {
    try {
      const stmt = db.prepare('DELETE FROM user_configs WHERE user_id = ?');
      stmt.run(userId);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete user config:', error);
      return { success: false, error: error.message };
    }
  });

  // Get system config
  ipcMain.handle('admin:get-system-config', async () => {
    try {
      const stmt = db.prepare('SELECT * FROM system_config ORDER BY created_at DESC LIMIT 1');
      const config = stmt.get() || {};
      return { success: true, config };
    } catch (error) {
      console.error('Failed to get system config:', error);
      return { success: false, error: error.message };
    }
  });

  // Save system config
  ipcMain.handle('admin:save-system-config', async (_, data) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO system_config (
          offline_mode_enabled,
          offline_max_storage,
          offline_sync_priority,
          backup_enabled,
          backup_frequency,
          backup_retention_days,
          debug_enabled,
          debug_log_level
        ) VALUES (
          @offline_mode_enabled,
          @offline_max_storage,
          @offline_sync_priority,
          @backup_enabled,
          @backup_frequency,
          @backup_retention_days,
          @debug_enabled,
          @debug_log_level
        )
      `);
      stmt.run(data);
      return { success: true };
    } catch (error) {
      console.error('Failed to save system config:', error);
      return { success: false, error: error.message };
    }
  });

  // Get system logs
  ipcMain.handle('admin:get-system-logs', async (_, filters = {}) => {
    try {
      let query = 'SELECT * FROM system_logs';
      const params = [];
      
      if (filters.level) {
        query += ' WHERE level = ?';
        params.push(filters.level);
      }
      
      query += ' ORDER BY created_at DESC LIMIT 100';
      
      const stmt = db.prepare(query);
      const logs = stmt.all(...params);
      return { success: true, logs };
    } catch (error) {
      console.error('Failed to get system logs:', error);
      return { success: false, error: error.message };
    }
  });

  // Clear system logs
  ipcMain.handle('admin:clear-system-logs', async () => {
    try {
      const stmt = db.prepare('DELETE FROM system_logs');
      stmt.run();
      return { success: true };
    } catch (error) {
      console.error('Failed to clear system logs:', error);
      return { success: false, error: error.message };
    }
  });
}
