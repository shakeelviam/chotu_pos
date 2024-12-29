"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('PRELOAD SCRIPT STARTING - ' + new Date().toISOString());
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electron', {
    minimize: () => electron_1.ipcRenderer.invoke('window:minimize'),
    maximize: () => electron_1.ipcRenderer.invoke('window:maximize'),
    close: () => electron_1.ipcRenderer.invoke('window:close'),
    login: (credentials) => electron_1.ipcRenderer.invoke('auth:login', credentials),
    logout: () => electron_1.ipcRenderer.invoke('auth:logout'),
    getSettings: () => electron_1.ipcRenderer.invoke('auth:getSettings'),
    getCurrentUser: () => electron_1.ipcRenderer.invoke('auth:getCurrentUser'),
    getItems: () => electron_1.ipcRenderer.invoke('items:getAll'),
    searchItems: (query) => electron_1.ipcRenderer.invoke('items:search', query),
    getItem: (itemCode) => electron_1.ipcRenderer.invoke('items:get', itemCode),
    updateItem: (itemCode, updates) => electron_1.ipcRenderer.invoke('items:update', itemCode, updates),
    createSale: (sale) => electron_1.ipcRenderer.invoke('sales:create', sale),
    getSales: () => electron_1.ipcRenderer.invoke('sales:getAll'),
    getSale: (id) => electron_1.ipcRenderer.invoke('sales:get', id),
    getCustomers: () => electron_1.ipcRenderer.invoke('customers:getAll'),
    searchCustomers: (query) => electron_1.ipcRenderer.invoke('customers:search', query),
    createCustomer: (customer) => electron_1.ipcRenderer.invoke('customers:create', customer),
    getCurrentSession: () => electron_1.ipcRenderer.invoke('pos:getCurrentSession'),
    openSession: () => electron_1.ipcRenderer.invoke('pos:openSession'),
    closeSession: () => electron_1.ipcRenderer.invoke('pos:closeSession'),
    createPOSOpening: (data) => electron_1.ipcRenderer.invoke('pos:createOpening', data),
    endSession: () => electron_1.ipcRenderer.invoke('pos:endSession'),
    getSessions: () => electron_1.ipcRenderer.invoke('pos:getSessions'),
    getSessionById: (id) => electron_1.ipcRenderer.invoke('pos:getSessionById', id),
    syncItems: () => electron_1.ipcRenderer.invoke('sync:items'),
    syncCustomers: () => electron_1.ipcRenderer.invoke('sync:customers'),
    syncAll: () => electron_1.ipcRenderer.invoke('sync:all'),
    getSyncStatus: () => electron_1.ipcRenderer.invoke('sync:status')
});
console.log('PRELOAD SCRIPT FINISHED - ' + new Date().toISOString());
//# sourceMappingURL=preload.js.map