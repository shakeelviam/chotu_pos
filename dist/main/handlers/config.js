"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerConfigHandlers = registerConfigHandlers;
const electron_1 = require("electron");
const erpnext_1 = require("../services/erpnext");
const config_1 = require("../services/config");
function registerConfigHandlers() {
    electron_1.ipcMain.handle('config:get', async () => {
        try {
            const config = await (0, config_1.getConfig)();
            return { success: true, config };
        }
        catch (error) {
            console.error('Failed to get config:', error);
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.handle('config:save', async (_, config) => {
        try {
            await (0, config_1.saveConfig)(config);
            try {
                const erpnext = await erpnext_1.ERPNextService.initialize();
                await erpnext.syncAll();
                return { success: true };
            }
            catch (error) {
                await (0, config_1.saveConfig)({ url: '', api_key: '', api_secret: '' });
                throw error;
            }
        }
        catch (error) {
            console.error('Failed to save config:', error);
            return {
                success: false,
                error: error.message || 'Failed to save configuration'
            };
        }
    });
}
//# sourceMappingURL=config.js.map