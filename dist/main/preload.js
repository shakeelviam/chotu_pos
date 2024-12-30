"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('PRELOAD SCRIPT STARTING - ' + new Date().toISOString());
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electron', {
    minimize: () => electron_1.ipcRenderer.invoke('window:minimize'),
    maximize: () => electron_1.ipcRenderer.invoke('window:maximize'),
    close: () => electron_1.ipcRenderer.invoke('window:close'),
    login: async (credentials) => electron_1.ipcRenderer.invoke('auth:login', credentials),
    adminLogin: async (credentials) => electron_1.ipcRenderer.invoke('auth:adminLogin', credentials),
    logout: async () => electron_1.ipcRenderer.invoke('auth:logout'),
    getSettings: async () => electron_1.ipcRenderer.invoke('auth:getSettings'),
    getCurrentUser: async () => electron_1.ipcRenderer.invoke('auth:getCurrentUser'),
    getItems: async () => electron_1.ipcRenderer.invoke('items:getAll'),
    searchItems: async (query) => electron_1.ipcRenderer.invoke('items:search', query),
    getItem: async (itemCode) => electron_1.ipcRenderer.invoke('items:get', itemCode),
    updateItem: async (itemCode, updates) => electron_1.ipcRenderer.invoke('items:update', itemCode, updates),
    createSale: async (sale) => electron_1.ipcRenderer.invoke('sales:create', sale),
    getSales: async () => electron_1.ipcRenderer.invoke('sales:getAll'),
    getSale: async (id) => electron_1.ipcRenderer.invoke('sales:get', id),
    getCustomers: async () => electron_1.ipcRenderer.invoke('customers:getAll'),
    searchCustomers: async (query) => electron_1.ipcRenderer.invoke('customers:search', query),
    createCustomer: async (customer) => electron_1.ipcRenderer.invoke('customers:create', customer),
    getCurrentSession: async () => electron_1.ipcRenderer.invoke('pos:getCurrentSession'),
    openSession: async () => electron_1.ipcRenderer.invoke('pos:openSession'),
    closeSession: async () => electron_1.ipcRenderer.invoke('pos:closeSession'),
    createPOSOpening: async (data) => electron_1.ipcRenderer.invoke('pos:createOpening', data),
    endSession: async () => electron_1.ipcRenderer.invoke('pos:endSession'),
    getSessions: async () => electron_1.ipcRenderer.invoke('pos:getSessions'),
    getSessionById: async (id) => electron_1.ipcRenderer.invoke('pos:getSessionById', id),
    syncItems: async () => electron_1.ipcRenderer.invoke('sync:items'),
    syncAll: async () => electron_1.ipcRenderer.invoke('sync:all'),
    getSyncStatus: async () => electron_1.ipcRenderer.invoke('sync:status'),
    testERPNextConnection: async (config) => electron_1.ipcRenderer.invoke('admin:test-connection', config),
    getERPNextConfig: async () => electron_1.ipcRenderer.invoke('admin:get-erpnext-config'),
    saveERPNextConfig: async (config) => electron_1.ipcRenderer.invoke('admin:save-erpnext-config', config),
    getPOSProfiles: async () => electron_1.ipcRenderer.invoke('admin:get-pos-profiles'),
    getRoleConfigs: async () => electron_1.ipcRenderer.invoke('admin:get-role-configs'),
    saveRoleConfig: async (config) => electron_1.ipcRenderer.invoke('admin:save-role-config', config),
    deleteRoleConfig: async (role) => electron_1.ipcRenderer.invoke('admin:delete-role-config', role),
    getSystemConfig: async () => electron_1.ipcRenderer.invoke('admin:get-system-config'),
    saveSystemConfig: async (config) => electron_1.ipcRenderer.invoke('admin:save-system-config', config),
    getSystemLogs: async (filters) => electron_1.ipcRenderer.invoke('admin:get-system-logs', filters),
    clearSystemLogs: async () => electron_1.ipcRenderer.invoke('admin:clear-system-logs')
});
console.log('PRELOAD SCRIPT FINISHED - ' + new Date().toISOString());
//# sourceMappingURL=preload.js.map