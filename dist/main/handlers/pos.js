"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPOSHandlers = registerPOSHandlers;
const electron_1 = require("electron");
const mockErpnext_1 = require("../services/mockErpnext");
const erpnextService = new mockErpnext_1.MockERPNextService();
function registerPOSHandlers() {
    electron_1.ipcMain.handle('pos:checkOpening', async () => {
        try {
            const balance = await erpnextService.getCurrentBalance();
            return {
                success: true,
                isOpen: balance.cash > 0 || balance.knet > 0,
                balance
            };
        }
        catch (error) {
            console.error('Failed to check POS opening:', error);
            return {
                success: false,
                error: 'Failed to check POS opening'
            };
        }
    });
    electron_1.ipcMain.handle('pos:checkSync', async () => {
        try {
            const status = await erpnextService.checkSyncStatus();
            return {
                success: true,
                pendingSync: {
                    sales: status.pendingSales,
                    items: status.pendingItems,
                    customers: status.pendingCustomers
                }
            };
        }
        catch (error) {
            console.error('Failed to check sync status:', error);
            return {
                success: false,
                error: 'Failed to check sync status'
            };
        }
    });
    electron_1.ipcMain.handle('pos:open', async (_event, data) => {
        try {
            const result = await erpnextService.createPOSOpening(data);
            return result;
        }
        catch (error) {
            console.error('Failed to create POS opening:', error);
            return {
                success: false,
                error: 'Failed to create POS opening'
            };
        }
    });
    electron_1.ipcMain.handle('pos:close', async (_event, data) => {
        try {
            const result = await erpnextService.createPOSClosing(data);
            return result;
        }
        catch (error) {
            console.error('Failed to create POS closing:', error);
            return {
                success: false,
                error: 'Failed to create POS closing'
            };
        }
    });
    electron_1.ipcMain.handle('pos:sync', async () => {
        try {
            const syncResult = await erpnextService.syncSales([]);
            return {
                success: syncResult,
                message: syncResult ? 'Sync completed successfully' : 'Sync failed'
            };
        }
        catch (error) {
            console.error('Failed to sync POS data:', error);
            return {
                success: false,
                error: 'Failed to sync POS data'
            };
        }
    });
}
//# sourceMappingURL=pos.js.map