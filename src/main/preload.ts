console.log('PRELOAD SCRIPT STARTING - ' + new Date().toISOString());

import { contextBridge, ipcRenderer } from 'electron';
import { AuthResponse } from '@/types';

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
    login: (credentials: { username: string; password: string }): Promise<AuthResponse> => 
      ipcRenderer.invoke('auth:login', credentials),
    logout: () => ipcRenderer.invoke('auth:logout'),
    getSettings: () => ipcRenderer.invoke('auth:getSettings'),
    getCurrentUser: () => ipcRenderer.invoke('auth:getCurrentUser'),

    // Items
    getItems: () => ipcRenderer.invoke('items:getAll'),
    searchItems: (query: string) => ipcRenderer.invoke('items:search', query),
    getItem: (itemCode: string) => ipcRenderer.invoke('items:get', itemCode),
    updateItem: (itemCode: string, updates: any) => ipcRenderer.invoke('items:update', itemCode, updates),

    // Sales
    createSale: (sale: any) => ipcRenderer.invoke('sales:create', sale),
    getSales: () => ipcRenderer.invoke('sales:getAll'),
    getSale: (id: string) => ipcRenderer.invoke('sales:get', id),

    // Customers
    getCustomers: () => ipcRenderer.invoke('customers:getAll'),
    searchCustomers: (query: string) => ipcRenderer.invoke('customers:search', query),
    createCustomer: (customer: any) => ipcRenderer.invoke('customers:create', customer),

    // POS Session
    getCurrentSession: () => ipcRenderer.invoke('pos:getCurrentSession'),
    openSession: () => ipcRenderer.invoke('pos:openSession'),
    closeSession: () => ipcRenderer.invoke('pos:closeSession'),
    createPOSOpening: (data: { cashAmount: number; knetAmount: number; profile: string }) => 
      ipcRenderer.invoke('pos:createOpening', data),
    endSession: () => ipcRenderer.invoke('pos:endSession'),
    getSessions: () => ipcRenderer.invoke('pos:getSessions'),
    getSessionById: (id: number) => ipcRenderer.invoke('pos:getSessionById', id),

    // Sync
    syncItems: () => ipcRenderer.invoke('sync:items'),
    syncCustomers: () => ipcRenderer.invoke('sync:customers'),
    syncAll: () => ipcRenderer.invoke('sync:all'),
    getSyncStatus: () => ipcRenderer.invoke('sync:status')
  }
);

console.log('PRELOAD SCRIPT FINISHED - ' + new Date().toISOString());
