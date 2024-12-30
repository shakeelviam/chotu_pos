"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAuthHandlers = registerAuthHandlers;
const electron_1 = require("electron");
const database_1 = require("../database");
const uuid_1 = require("uuid");
const MOCK_SETTINGS = {
    currency: "KWD",
    currency_symbol: "KD",
    currency_precision: 3,
    currency_format: "#,###.###"
};
const TEST_CREDENTIALS = {
    username: 'testuser',
    password: 'testpass123',
    role: 'manager'
};
const SUPER_ADMIN = {
    username: 'admin',
    password: 'admin123',
    role: 'super_admin'
};
function registerAuthHandlers() {
    let currentSession = null;
    electron_1.ipcMain.handle('auth:login', async (_, credentials) => {
        console.log('Login attempt:', { username: credentials.username });
        let user = null;
        if (credentials.username === TEST_CREDENTIALS.username && credentials.password === TEST_CREDENTIALS.password) {
            user = { username: TEST_CREDENTIALS.username, role: TEST_CREDENTIALS.role };
        }
        else if (credentials.username === SUPER_ADMIN.username && credentials.password === SUPER_ADMIN.password) {
            user = { username: SUPER_ADMIN.username, role: SUPER_ADMIN.role };
        }
        if (user) {
            currentSession = {
                id: (0, uuid_1.v4)(),
                user: user.username,
                opening_time: new Date().toISOString(),
                status: 'open',
                opening_balance: 0,
                sales: []
            };
            const db = (0, database_1.getDatabase)();
            db.prepare(`
        INSERT INTO pos_sessions (
          id,
          user,
          opening_time,
          status,
          opening_balance
        ) VALUES (?, ?, ?, ?, ?)
      `).run(currentSession.id, currentSession.user, currentSession.opening_time, currentSession.status, currentSession.opening_balance);
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
    electron_1.ipcMain.handle('auth:adminLogin', async (_, credentials) => {
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
    electron_1.ipcMain.handle('auth:logout', async () => {
        if (!currentSession) {
            return { success: false, error: 'No active session' };
        }
        try {
            const db = (0, database_1.getDatabase)();
            db.prepare(`
        UPDATE pos_sessions 
        SET status = ?, closing_time = ?
        WHERE id = ?
      `).run('closed', new Date().toISOString(), currentSession.id);
            currentSession = null;
            return { success: true };
        }
        catch (error) {
            console.error('Error closing session:', error);
            return { success: false, error: 'Failed to close session' };
        }
    });
    electron_1.ipcMain.handle('auth:getCurrentUser', async () => {
        try {
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
        }
        catch (error) {
            console.error('Failed to get current user:', error);
            return {
                success: false,
                error: error.message || 'Failed to get current user'
            };
        }
    });
    electron_1.ipcMain.handle('auth:getSettings', async () => {
        return { success: true, settings: MOCK_SETTINGS };
    });
    electron_1.ipcMain.handle('pos:getCurrentSession', async () => {
        return currentSession;
    });
}
//# sourceMappingURL=auth.js.map