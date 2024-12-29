"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERPNextService = void 0;
const axios_1 = require("axios");
const config_1 = require("./config");
class ERPNextService {
    constructor(config) {
        this.posProfile = null;
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
    getCurrentPOSProfile() {
        return this.posProfile;
    }
    getAxiosInstance() {
        return this.axiosInstance;
    }
    async syncAll() {
        try {
            await this.getPOSProfile();
            const items = await this.syncItems();
            const customers = await this.syncCustomers();
            const payments = await this.syncPaymentMethods();
            const taxes = await this.syncTaxTemplates();
            const priceLists = await this.syncPriceLists();
            return {
                success: true
            };
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
                price_list: this.posProfile?.price_list
            }
        });
        return response.data.message || [];
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
}
exports.ERPNextService = ERPNextService;
//# sourceMappingURL=erpnext.js.map