"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCustomerHandlers = registerCustomerHandlers;
const electron_1 = require("electron");
const MOCK_CUSTOMERS = [
    {
        id: 1,
        name: 'Walk-in Customer',
        mobile: '0000000000'
    },
    {
        id: 2,
        name: 'John Doe',
        mobile: '1234567890'
    },
    {
        id: 3,
        name: 'Jane Smith',
        mobile: '0987654321'
    }
];
const DEFAULT_CUSTOMER = MOCK_CUSTOMERS[0];
function registerCustomerHandlers() {
    electron_1.ipcMain.handle('customers:search', async (_, query) => {
        try {
            const searchResults = MOCK_CUSTOMERS.filter(customer => customer.name.toLowerCase().includes(query.toLowerCase()) ||
                customer.mobile.includes(query));
            return { success: true, customers: searchResults };
        }
        catch (error) {
            console.error('Failed to search customers:', error);
            return { success: false, error: error.message || 'Failed to search customers' };
        }
    });
    electron_1.ipcMain.handle('customers:get-by-mobile', async (_, mobile) => {
        try {
            const customer = MOCK_CUSTOMERS.find(c => c.mobile === mobile);
            if (!customer) {
                return { success: false, error: 'Customer not found' };
            }
            return { success: true, customer };
        }
        catch (error) {
            console.error('Failed to get customer:', error);
            return { success: false, error: error.message || 'Failed to get customer' };
        }
    });
    electron_1.ipcMain.handle('customers:get-default', async () => {
        try {
            return { success: true, customer: DEFAULT_CUSTOMER };
        }
        catch (error) {
            console.error('Failed to get default customer:', error);
            return { success: false, error: error.message || 'Failed to get default customer' };
        }
    });
    electron_1.ipcMain.handle('customers:create', async (_, customerData) => {
        try {
            const newCustomer = {
                id: MOCK_CUSTOMERS.length + 1,
                ...customerData
            };
            MOCK_CUSTOMERS.push(newCustomer);
            return { success: true, customer: newCustomer };
        }
        catch (error) {
            console.error('Failed to create customer:', error);
            return { success: false, error: error.message || 'Failed to create customer' };
        }
    });
    electron_1.ipcMain.handle('customers:update', async (_, id, updates) => {
        try {
            const customerIndex = MOCK_CUSTOMERS.findIndex(c => c.id === id);
            if (customerIndex === -1) {
                return { success: false, error: 'Customer not found' };
            }
            const updatedCustomer = {
                ...MOCK_CUSTOMERS[customerIndex],
                ...updates
            };
            MOCK_CUSTOMERS[customerIndex] = updatedCustomer;
            return { success: true, customer: updatedCustomer };
        }
        catch (error) {
            console.error('Failed to update customer:', error);
            return { success: false, error: error.message || 'Failed to update customer' };
        }
    });
}
//# sourceMappingURL=customers.js.map