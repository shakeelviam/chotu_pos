"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERPNextService = void 0;
exports.getERPNextService = getERPNextService;
const axios_1 = require("axios");
const config_1 = require("./config");
class ERPNextService {
    constructor(config) {
        this.posProfile = null;
        this.currentSession = null;
        this.config = config;
        this.axiosInstance = axios_1.default.create({
            baseURL: config.url,
            headers: {
                'Authorization': `token ${config.api_key}:${config.api_secret}`,
                'Content-Type': 'application/json'
            }
        });
    }
    static async initialize() {
        if (!ERPNextService.instance) {
            const config = await (0, config_1.getConfig)();
            if (!config.url || !config.api_key || !config.api_secret) {
                throw new Error('ERPNext not configured');
            }
            ERPNextService.instance = new ERPNextService(config);
        }
        return ERPNextService.instance;
    }
    getAxiosInstance() {
        return this.axiosInstance;
    }
    async authenticate(username, password) {
        try {
            const response = await this.axiosInstance.post('/api/method/login', {
                usr: username,
                pwd: password
            });
            if (response.data.message === 'Logged In') {
                const userResponse = await this.axiosInstance.get('/api/method/frappe.auth.get_logged_user');
                const user = userResponse.data;
                const permResponse = await this.axiosInstance.get(`/api/resource/User/${username}`);
                const userPerms = permResponse.data.data;
                let role = 'cashier';
                if (userPerms.roles.some((r) => r.role === 'System Manager')) {
                    role = 'admin';
                }
                else if (userPerms.roles.some((r) => r.role === 'Sales Manager')) {
                    role = 'manager';
                }
                return {
                    success: true,
                    user: {
                        username: user.message,
                        role,
                        erpnextUser: true
                    }
                };
            }
            return { success: false, error: 'Invalid credentials' };
        }
        catch (error) {
            console.error('Authentication error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Authentication failed'
            };
        }
    }
    async createPOSOpeningEntry(data) {
        try {
            const response = await this.axiosInstance.post('/api/resource/POS Opening Entry', {
                doctype: 'POS Opening Entry',
                company: data.company,
                pos_profile: data.pos_profile,
                balance_details: data.balance_details,
                status: 'Open',
                posting_date: new Date().toISOString().split('T')[0],
            });
            if (response.data.data) {
                this.currentSession = response.data.data.name;
                return {
                    success: true,
                    session_id: response.data.data.name
                };
            }
            throw new Error('Failed to create POS Opening Entry');
        }
        catch (error) {
            console.error('POS Opening Entry error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to create POS Opening Entry'
            };
        }
    }
    async createPOSClosingEntry(data) {
        try {
            const response = await this.axiosInstance.post('/api/resource/POS Closing Entry', {
                doctype: 'POS Closing Entry',
                pos_opening_entry: data.pos_opening_entry,
                closing_details: data.closing_details,
                posting_date: new Date().toISOString().split('T')[0],
                status: 'Submitted'
            });
            if (response.data.data) {
                this.currentSession = null;
                return { success: true };
            }
            throw new Error('Failed to create POS Closing Entry');
        }
        catch (error) {
            console.error('POS Closing Entry error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to create POS Closing Entry'
            };
        }
    }
    async getCurrentPOSSession() {
        if (this.currentSession) {
            return { session_id: this.currentSession };
        }
        try {
            const response = await this.axiosInstance.get('/api/resource/POS Opening Entry', {
                params: {
                    filters: JSON.stringify([
                        ['status', '=', 'Open'],
                        ['docstatus', '=', 1]
                    ]),
                    limit: 1
                }
            });
            if (response.data.data?.length > 0) {
                this.currentSession = response.data.data[0].name;
                return { session_id: this.currentSession };
            }
            return { error: 'No active POS session found' };
        }
        catch (error) {
            console.error('Get POS Session error:', error);
            return { error: error.response?.data?.message || 'Failed to get POS session' };
        }
    }
    async getPOSProfile(profileName) {
        try {
            if (!profileName && !this.posProfile?.name) {
                throw new Error('POS Profile not set');
            }
            const name = profileName || this.posProfile?.name;
            if (!name) {
                throw new Error('POS Profile name not provided');
            }
            const response = await this.axiosInstance.get(`/api/resource/POS Profile/${name}`);
            const profile = response.data.data;
            this.posProfile = profile;
            return profile;
        }
        catch (error) {
            console.error('Failed to get POS Profile:', error);
            throw error;
        }
    }
    async getPOSProfiles() {
        try {
            if (this.config.useMockData) {
                return [
                    { name: 'Retail POS', disabled: 0 },
                    { name: 'Restaurant POS', disabled: 0 }
                ];
            }
            const response = await this.axiosInstance.get('/api/resource/POS Profile');
            return response.data.data;
        }
        catch (error) {
            console.error('Failed to fetch POS profiles:', error);
            throw error;
        }
    }
    getCurrentPOSProfile() {
        return this.posProfile;
    }
    async syncAll() {
        try {
            await this.getPOSProfile();
            await this.syncItems();
            await this.syncCustomers();
            await this.syncPaymentMethods();
            await this.syncTaxTemplates();
            await this.syncPriceLists();
            await this.syncScaleItems();
            return { success: true };
        }
        catch (error) {
            console.error('Sync failed:', error);
            return {
                success: false,
                error: error.message || 'Failed to sync with ERPNext'
            };
        }
    }
    async syncItems() {
        const response = await this.axiosInstance.get('/api/method/erpnext.stock.get_all_items', {
            params: {
                warehouse: this.posProfile?.warehouse,
                price_list: this.posProfile?.price_list,
                fields: JSON.stringify([
                    'name', 'item_name', 'item_code', 'standard_rate', 'stock_uom',
                    'is_stock_item', 'has_batch_no', 'has_serial_no', 'item_group',
                    'custom_scale_item_code'
                ])
            }
        });
        return response.data.message || [];
    }
    async syncScaleItems() {
        const response = await this.axiosInstance.get('/api/method/erpnext.stock.get_all_items', {
            params: {
                warehouse: this.posProfile?.warehouse,
                price_list: this.posProfile?.price_list,
                filters: JSON.stringify([['item_group', '=', 'Weighed Items']]),
                fields: JSON.stringify([
                    'name', 'item_name', 'item_code', 'standard_rate',
                    'stock_uom', 'custom_scale_item_code'
                ])
            }
        });
        return response.data.message || [];
    }
    async getScaleItemDetails(itemCode) {
        try {
            const response = await this.axiosInstance.get(`/api/resource/Item/${itemCode}`, {
                params: {
                    fields: JSON.stringify([
                        'item_code',
                        'custom_scale_item_code',
                        'standard_rate',
                        'stock_uom',
                        'item_group'
                    ])
                }
            });
            const item = response.data.data;
            if (item && item.item_group === 'Weighed Items') {
                return {
                    success: true,
                    data: {
                        item_code: item.item_code,
                        scale_item_code: item.custom_scale_item_code,
                        standard_rate: item.standard_rate,
                        uom: item.stock_uom
                    }
                };
            }
            throw new Error('Scale item details not found');
        }
        catch (error) {
            console.error('Failed to get scale item details:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to get scale item details'
            };
        }
    }
    async parseScaleBarcode(barcode) {
        try {
            const scaleItemCode = barcode.substring(0, 4);
            const weight = parseInt(barcode.substring(4, 8)) / 1000;
            const rate = parseInt(barcode.substring(8, 12)) / 1000;
            const response = await this.axiosInstance.get('/api/resource/Item', {
                params: {
                    filters: JSON.stringify([
                        ['custom_scale_item_code', '=', scaleItemCode],
                        ['item_group', '=', 'Weighed Items']
                    ]),
                    limit: 1
                }
            });
            if (response.data.data?.length > 0) {
                const item = response.data.data[0];
                return {
                    success: true,
                    data: {
                        item_code: item.name,
                        weight,
                        rate,
                        total: parseFloat((weight * rate).toFixed(3))
                    }
                };
            }
            throw new Error('Scale item not found');
        }
        catch (error) {
            console.error('Failed to parse scale barcode:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to parse scale barcode'
            };
        }
    }
    async syncCustomers() {
        const response = await this.axiosInstance.get('/api/method/erpnext.selling.get_customers', {
            params: {
                territory: this.posProfile?.territory
            }
        });
        return response.data.message || [];
    }
    async syncPaymentMethods() {
        const response = await this.axiosInstance.get('/api/method/erpnext.accounts.get_payment_methods', {
            params: {
                pos_profile: this.posProfile?.name
            }
        });
        return response.data.message || [];
    }
    async syncTaxTemplates() {
        const response = await this.axiosInstance.get('/api/method/erpnext.accounts.get_tax_templates', {
            params: {
                company: this.posProfile?.company
            }
        });
        return response.data.message || [];
    }
    async syncPriceLists() {
        const response = await this.axiosInstance.get('/api/method/erpnext.stock.get_price_lists', {
            params: {
                company: this.posProfile?.company
            }
        });
        return response.data.message || [];
    }
    async syncInvoice(invoice) {
        try {
            const response = await this.axiosInstance.post('/api/resource/POS Invoice', {
                doctype: 'POS Invoice',
                ...invoice,
                docstatus: 1,
                is_pos: 1,
                pos_profile: this.posProfile?.name,
                created_at: invoice.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            return { success: true };
        }
        catch (error) {
            console.error('Invoice sync error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to sync invoice'
            };
        }
    }
    async testConnection() {
        try {
            const response = await this.axiosInstance.get('/api/method/frappe.auth.get_logged_user');
            return { success: true };
        }
        catch (error) {
            console.error('Connection test failed:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Connection test failed'
            };
        }
    }
}
exports.ERPNextService = ERPNextService;
function getERPNextService() {
    return ERPNextService.initialize();
}
//# sourceMappingURL=erpnext.js.map