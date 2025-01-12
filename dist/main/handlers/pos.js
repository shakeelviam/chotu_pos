"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPOSHandlers = registerPOSHandlers;
const electron_1 = require("electron");
const mockErpnext_1 = require("../services/mockErpnext");
const database_1 = require("../database");
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
    electron_1.ipcMain.handle('pos:parseScaleBarcode', async (_, barcode) => {
        try {
            if (!barcode || barcode.length !== 12 || !/^\d+$/.test(barcode)) {
                throw new Error('Invalid scale barcode format');
            }
            const productCode = barcode.substring(0, 4);
            const weightInGrams = parseInt(barcode.substring(4, 8));
            const rateInMillis = parseInt(barcode.substring(8, 12));
            if (isNaN(weightInGrams) || isNaN(rateInMillis)) {
                throw new Error('Invalid weight or rate in barcode');
            }
            const weight = weightInGrams / 1000;
            const rate = rateInMillis / 1000;
            const db = (0, database_1.getDatabase)();
            const item = db.prepare(`
        SELECT * FROM items
        WHERE item_group = 'Weighed Items'
        AND scale_item_code = ?
      `).get(productCode);
            if (!item) {
                throw new Error('Scale item not found');
            }
            const total = weight * rate;
            return {
                success: true,
                item_code: item.item_code,
                item_name: item.item_name,
                weight,
                rate,
                total: parseFloat(total.toFixed(3)),
                uom: item.uom || 'Kg',
                standard_rate: item.standard_rate,
                item_group: item.item_group
            };
        }
        catch (error) {
            console.error('Failed to parse scale barcode:', error);
            return {
                success: false,
                error: error.message || 'Failed to parse scale barcode'
            };
        }
    });
    electron_1.ipcMain.handle('pos:calculateScalePrice', async (_, data) => {
        try {
            if (!data.weight || data.weight <= 0) {
                throw new Error('Invalid weight value');
            }
            const db = (0, database_1.getDatabase)();
            const item = db.prepare(`
        SELECT * FROM items
        WHERE item_code = ?
        AND item_group = 'Weighed Items'
      `).get(data.itemCode);
            if (!item) {
                throw new Error('Item not found or not a weighed item');
            }
            const total = data.weight * item.standard_rate;
            return {
                success: true,
                item_code: item.item_code,
                item_name: item.item_name,
                weight: data.weight,
                rate: item.standard_rate,
                total: parseFloat(total.toFixed(3)),
                uom: item.uom || 'Kg',
                item_group: item.item_group
            };
        }
        catch (error) {
            console.error('Failed to calculate scale price:', error);
            return {
                success: false,
                error: error.message
            };
        }
    });
    electron_1.ipcMain.handle('pos:getItemByScaleCode', async (_, scaleCode) => {
        try {
            const db = (0, database_1.getDatabase)();
            const item = db.prepare(`
        SELECT * FROM items
        WHERE item_group = 'Weighed Items'
        AND scale_item_code = ?
      `).get(scaleCode);
            if (!item) {
                throw new Error('Scale item not found');
            }
            return {
                success: true,
                item: item
            };
        }
        catch (error) {
            console.error('Failed to get item by scale code:', error);
            return {
                success: false,
                error: error.message
            };
        }
    });
}
//# sourceMappingURL=pos.js.map