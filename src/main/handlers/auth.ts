import { ipcMain } from 'electron';
import { getDatabase } from '../database';
import { User, UserRole, Settings, AuthResponse, SettingsResponse, POSSession } from '@/shared/types';
import { v4 as uuidv4 } from 'uuid';

// Mock settings
const MOCK_SETTINGS: Settings = {
  currency: "KWD",
  currency_symbol: "KD",
  currency_precision: 3,
  currency_format: "#,###.###"
};

// Test credentials - REMOVE IN PRODUCTION
const TEST_CREDENTIALS = {
  username: 'testuser',
  password: 'testpass123',
  role: 'manager' as UserRole
};

const SUPER_ADMIN = {
  username: 'admin',
  password: 'admin123',
  role: 'super_admin' as UserRole
};

export function registerAuthHandlers() {
  let currentSession: POSSession | null = null;

  // Login handler
  ipcMain.handle('auth:login', async (_, credentials: { username: string; password: string }): Promise<AuthResponse> => {
    console.log('Login attempt:', { username: credentials.username });

    // Mock authentication
    let user: User | null = null;
    if (credentials.username === TEST_CREDENTIALS.username && credentials.password === TEST_CREDENTIALS.password) {
      user = { username: TEST_CREDENTIALS.username, role: TEST_CREDENTIALS.role };
    } else if (credentials.username === SUPER_ADMIN.username && credentials.password === SUPER_ADMIN.password) {
      user = { username: SUPER_ADMIN.username, role: SUPER_ADMIN.role };
    }

    if (user) {
      // Create a new POS session
      currentSession = {
        id: uuidv4(),
        user: user.username,
        opening_time: new Date().toISOString(),
        status: 'open',
        opening_balance: 0,
        sales: []
      };

      // Store session in database
      const db = getDatabase();
      db.prepare(`
        INSERT INTO pos_sessions (
          id,
          user,
          opening_time,
          status,
          opening_balance
        ) VALUES (?, ?, ?, ?, ?)
      `).run(
        currentSession.id,
        currentSession.user,
        currentSession.opening_time,
        currentSession.status,
        currentSession.opening_balance
      );

      return {
        success: true,
        user,
        settings: MOCK_SETTINGS
      };
    }

    return {
      success: false,
      error: 'Invalid credentials'
    };
  });

  // Admin login handler
  ipcMain.handle('auth:adminLogin', async (_, credentials: { username: string; password: string }): Promise<AuthResponse> => {
    console.log('Admin login attempt:', { username: credentials.username });

    if (credentials.username === SUPER_ADMIN.username && credentials.password === SUPER_ADMIN.password) {
      return {
        success: true,
        user: { username: SUPER_ADMIN.username, role: SUPER_ADMIN.role },
        settings: MOCK_SETTINGS
      };
    }

    return {
      success: false,
      error: 'Invalid admin credentials'
    };
  });

  // Logout handler
  ipcMain.handle('auth:logout', async () => {
    if (!currentSession) {
      return { success: false, error: 'No active session' };
    }

    try {
      const db = getDatabase();
      db.prepare(`
        UPDATE pos_sessions 
        SET status = ?, closing_time = ?
        WHERE id = ?
      `).run('closed', new Date().toISOString(), currentSession.id);

      currentSession = null;
      return { success: true };
    } catch (error) {
      console.error('Error closing session:', error);
      return { success: false, error: 'Failed to close session' };
    }
  });

  // Get current user
  ipcMain.handle('auth:getCurrentUser', async (): Promise<AuthResponse> => {
    try {
      // For now, just return the current session's user
      if (!currentSession) {
        return {
          success: false,
          error: 'No active session'
        };
      }

      return {
        success: true,
        user: {
          username: currentSession.user,
          role: currentSession.user === SUPER_ADMIN.username ? SUPER_ADMIN.role : TEST_CREDENTIALS.role
        }
      };
    } catch (error) {
      console.error('Failed to get current user:', error);
      return {
        success: false,
        error: error.message || 'Failed to get current user'
      };
    }
  });

  // Get settings
  ipcMain.handle('auth:getSettings', async (): Promise<SettingsResponse> => {
    return { success: true, settings: MOCK_SETTINGS };
  });

  // Get current session
  ipcMain.handle('pos:getCurrentSession', async (): Promise<POSSession | null> => {
    return currentSession;
  });
}
