"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerItemHandlers = registerItemHandlers;
const electron_1 = require("electron");
const mockErpnext_1 = require("../services/mockErpnext");
const erpnextService = new mockErpnext_1.MockERPNextService();
function registerItemHandlers() {
    console.log('Registering items handlers...');
    electron_1.ipcMain.handle('items:getAll', async () => {
        console.log('items:getAll handler called');
        try {
            const { items } = await erpnextService.getItems();
            return { success: true, items };
        }
        catch (error) {
            console.error('Failed to get items:', error);
            return { success: false, error: error.message || 'Failed to fetch items' };
        }
    });
    electron_1.ipcMain.handle('items:search', async (_, query) => {
        console.log('items:search handler called with query:', query);
        try {
            const { items } = await erpnextService.getItems();
            const searchQuery = query.toLowerCase();
            const filteredItems = items.filter(item => item.item_code.toLowerCase().includes(searchQuery) ||
                item.item_name.toLowerCase().includes(searchQuery) ||
                item.barcode?.toLowerCase().includes(searchQuery));
            return { success: true, items: filteredItems };
        }
        catch (error) {
            console.error('Failed to search items:', error);
            return { success: false, error: error.message || 'Failed to search items' };
        }
    });
    console.log('Items handlers registered successfully');
}
//# sourceMappingURL=items.js.map