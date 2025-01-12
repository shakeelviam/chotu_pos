console.log('PRELOAD SCRIPT STARTING - ' + new Date().toISOString());

import { contextBridge, ipcRenderer } from 'electron';
import { AuthResponse, POSOpeningEntry, POSBalanceDetail } from '@/types';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    // Window controls
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),

    // Auth
    login: async (credentials: { username: string; password: string }): Promise<AuthResponse> =>
      ipcRenderer.invoke('auth:login', credentials),
    adminLogin: async (credentials: { username: string; password: string }): Promise<AuthResponse> =>
      ipcRenderer.invoke('auth:adminLogin', credentials),
    logout: async () => ipcRenderer.invoke('auth:logout'),
    getSettings: async () => ipcRenderer.invoke('auth:getSettings'),
    getCurrentUser: async () => ipcRenderer.invoke('auth:getCurrentUser'),

    // Items
    getItems: async () => ipcRenderer.invoke('items:getAll'),
    searchItems: async (query: string) => ipcRenderer.invoke('items:search', query),
    getItem: async (itemCode: string) => ipcRenderer.invoke('items:get', itemCode),
    updateItem: async (itemCode: string, updates: any) => ipcRenderer.invoke('items:update', itemCode, updates),

    // Sales
    createSale: async (sale: any) => ipcRenderer.invoke('sales:create', sale),
    getSales: async () => ipcRenderer.invoke('sales:getAll'),
    getSale: async (id: string) => ipcRenderer.invoke('sales:get', id),

    // Customers
    getCustomers: async () => ipcRenderer.invoke('customers:getAll'),
    searchCustomers: async (query: string) => ipcRenderer.invoke('customers:search', query),
    createCustomer: async (customer: any) => ipcRenderer.invoke('customers:create', customer),

    // POS Session
    getCurrentSession: async () => ipcRenderer.invoke('pos:getCurrentSession'),
    getCompanies: async () => ipcRenderer.invoke('getCompanies'),
    getPaymentMethods: async () => ipcRenderer.invoke('getPaymentMethods'),
    getPOSProfiles: async (company: string) => ipcRenderer.invoke('getPOSProfiles', company),
    createPOSOpening: async (data: {
      company: string;
      posProfile: string;
      balanceDetails: POSBalanceDetail[];
    }) => ipcRenderer.invoke('createPOSOpening', data),
    getCurrentPOSEntry: async () => ipcRenderer.invoke('getCurrentPOSEntry'),
    closePOSEntry: async (data: {
      id: string;
      closingDetails: POSBalanceDetail[];
    }) => ipcRenderer.invoke('closePOSEntry', data),
    openSession: async () => ipcRenderer.invoke('pos:openSession'),
    closeSession: async () => ipcRenderer.invoke('pos:closeSession'),
    endSession: async () => ipcRenderer.invoke('pos:endSession'),
    getSessions: async () => ipcRenderer.invoke('pos:getSessions'),
    getSessionById: async (id: number) => ipcRenderer.invoke('pos:getSessionById', id),

    // Sync
    syncItems: async () => ipcRenderer.invoke('sync:items'),
    syncAll: async () => ipcRenderer.invoke('sync:all'),
    getSyncStatus: async () => ipcRenderer.invoke('sync:status'),
    syncPOSData: async () => ipcRenderer.invoke('syncPOSData'),

    // Admin
    testERPNextConnection: async (config: any) => ipcRenderer.invoke('admin:test-connection', config),
    getERPNextConfig: async () => ipcRenderer.invoke('admin:get-erpnext-config'),
    saveERPNextConfig: async (config: any) => ipcRenderer.invoke('admin:save-erpnext-config', config),
    getPOSProfilesAdmin: async () => ipcRenderer.invoke('admin:get-pos-profiles'),
    getRoleConfigs: async () => ipcRenderer.invoke('admin:get-role-configs'),
    saveRoleConfig: async (config: any) => ipcRenderer.invoke('admin:save-role-config', config),
    deleteRoleConfig: async (role: string) => ipcRenderer.invoke('admin:delete-role-config', role),
    getSystemConfig: async () => ipcRenderer.invoke('admin:get-system-config'),
    saveSystemConfig: async (config: any) => ipcRenderer.invoke('admin:save-system-config', config),
    getSystemLogs: async (filters?: { level?: string }) => ipcRenderer.invoke('admin:get-system-logs', filters),
    clearSystemLogs: async () => ipcRenderer.invoke('admin:clear-system-logs')
  }
);

console.log('PRELOAD SCRIPT FINISHED - ' + new Date().toISOString());