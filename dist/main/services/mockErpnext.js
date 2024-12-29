"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockERPNextService = void 0;
const mockData_1 = require("../mock/mockData");
class MockERPNextService {
    constructor() {
        this.currentBalance = {
            cash: 0,
            knet: 0
        };
        this.sales = [];
        this.syncedSales = [];
    }
    async authenticate(username, password) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (username === mockData_1.mockUser.username && password === mockData_1.mockUser.password) {
            return {
                success: true,
                user: mockData_1.mockUser,
                settings: mockData_1.mockSettings
            };
        }
        return {
            success: false,
            error: 'Invalid credentials'
        };
    }
    async getSettings() {
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
            success: true,
            settings: mockData_1.mockSettings
        };
    }
    async createPOSOpening(data) {
        await new Promise(resolve => setTimeout(resolve, 500));
        this.currentBalance = {
            cash: data.openingBalance.cash,
            knet: data.openingBalance.knet
        };
        return {
            success: true,
            message: 'POS opening entry created successfully'
        };
    }
    async createPOSClosing(data) {
        await new Promise(resolve => setTimeout(resolve, 500));
        this.currentBalance = {
            cash: 0,
            knet: 0
        };
        return {
            success: true,
            message: 'POS closing entry created successfully'
        };
    }
    async getCurrentBalance() {
        return this.currentBalance;
    }
    async checkSyncStatus() {
        await new Promise(resolve => setTimeout(resolve, 500));
        const unsyncedSales = this.sales.filter(sale => !this.syncedSales.includes(sale));
        return {
            pendingItems: false,
            pendingCustomers: false,
            pendingSales: unsyncedSales.length > 0
        };
    }
    async syncInventory() {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            success: true,
            data: mockData_1.mockItems
        };
    }
    async syncSales(sales) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (sales) {
            this.sales.push(...sales);
        }
        this.syncedSales = [...this.sales];
        console.log("Syncing sales:", sales);
        return true;
    }
    async syncPayments() {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            success: true,
            message: 'Payments synced successfully'
        };
    }
    async getItems() {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { items: mockData_1.mockItems };
    }
    async getCustomers() {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [
            {
                id: 1,
                name: 'Walk-in Customer',
                mobile: '0000000000'
            }
        ];
    }
    async createSale(saleData) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (saleData.paymentMethod === 'cash') {
            this.currentBalance.cash += saleData.totalAmount;
        }
        else if (saleData.paymentMethod === 'knet') {
            this.currentBalance.knet += saleData.totalAmount;
        }
        this.sales.push(saleData);
        return {
            success: true,
            message: 'Sale created successfully'
        };
    }
}
exports.MockERPNextService = MockERPNextService;
//# sourceMappingURL=mockErpnext.js.map