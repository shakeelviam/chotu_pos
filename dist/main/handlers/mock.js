"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMockHandlers = registerMockHandlers;
const electron_1 = require("electron");
const MOCK_ITEMS = [
    {
        item_code: "ITEM-001",
        item_name: "Test Item 1",
        description: "This is a test item",
        standard_rate: 10.000,
        current_stock: 100,
        barcode: "123456789"
    },
    {
        item_code: "ITEM-002",
        item_name: "Test Item 2",
        description: "This is another test item",
        standard_rate: 20.000,
        current_stock: 50,
        barcode: "987654321"
    },
    {
        item_code: "ITEM-003",
        item_name: "Test Item 3",
        description: "This is yet another test item",
        standard_rate: 30.000,
        current_stock: 75,
        barcode: "456789123"
    }
];
const MOCK_CUSTOMERS = [
    {
        id: 1,
        name: "John Doe",
        mobile: "1234567890"
    },
    {
        id: 2,
        name: "Jane Smith",
        mobile: "0987654321"
    }
];
function registerMockHandlers() {
    electron_1.ipcMain.handle('auth:getSettings', async () => {
        try {
            return {
                success: true,
                settings: {
                    currency: "KWD",
                    currency_symbol: "KD",
                    currency_precision: 3,
                    currency_format: "#,###.###"
                }
            };
        }
        catch (error) {
            console.error('Failed to get settings:', error);
            return { success: false, error: error.message || 'Failed to get settings' };
        }
    });
    electron_1.ipcMain.handle('items:get', async () => {
        try {
            return { success: true, items: MOCK_ITEMS };
        }
        catch (error) {
            console.error('Failed to get items:', error);
            return { success: false, error: error.message || 'Failed to get items' };
        }
    });
    electron_1.ipcMain.handle('items:search', async (_, query) => {
        try {
            const filteredItems = MOCK_ITEMS.filter(item => item.item_name.toLowerCase().includes(query.toLowerCase()) ||
                item.item_code.toLowerCase().includes(query.toLowerCase()) ||
                item.barcode.toLowerCase().includes(query.toLowerCase()));
            return { success: true, items: filteredItems };
        }
        catch (error) {
            console.error('Failed to search items:', error);
            return { success: false, error: error.message || 'Failed to search items' };
        }
    });
    electron_1.ipcMain.handle('customers:search', async (_, query) => {
        try {
            const filteredCustomers = MOCK_CUSTOMERS.filter(customer => customer.name.toLowerCase().includes(query.toLowerCase()) ||
                customer.mobile.includes(query));
            return { success: true, customers: filteredCustomers };
        }
        catch (error) {
            console.error('Failed to search customers:', error);
            return { success: false, error: error.message || 'Failed to search customers' };
        }
    });
    electron_1.ipcMain.handle('customers:get-by-mobile', async (_, mobile) => {
        try {
            const customer = MOCK_CUSTOMERS.find(c => c.mobile === mobile);
            return { success: true, customer };
        }
        catch (error) {
            console.error('Failed to get customer:', error);
            return { success: false, error: error.message || 'Failed to get customer' };
        }
    });
    electron_1.ipcMain.handle('customers:get-default', async () => {
        try {
            return { success: true, customer: MOCK_CUSTOMERS[0] };
        }
        catch (error) {
            console.error('Failed to get default customer:', error);
            return { success: false, error: error.message || 'Failed to get default customer' };
        }
    });
    electron_1.ipcMain.handle('pos:getCurrentSession', async () => {
        try {
            return {
                success: true,
                session: {
                    id: 1,
                    status: 'open',
                    opening_time: new Date().toISOString(),
                    user: 'testuser'
                }
            };
        }
        catch (error) {
            console.error('Failed to get current session:', error);
            return { success: false, error: error.message || 'Failed to get current session' };
        }
    });
}
//# sourceMappingURL=mock.js.map