import { User } from './types';

export interface ElectronAPI {
  // Auth
  login: (username: string, password: string) => Promise<any>;
  logout: () => Promise<any>;
  getSettings: () => Promise<any>;

  // Items
  getItems: () => Promise<any>;
  searchItems: (query: string) => Promise<any>;

  // Customers
  searchCustomers: (query: string) => Promise<any>;
  getCustomerByMobile: (mobile: string) => Promise<any>;
  getDefaultCustomer: () => Promise<any>;
  createCustomer: (customer: { name: string; mobile: string }) => Promise<any>;
  updateCustomer: (id: number, updates: any) => Promise<any>;

  // Sales
  createSale: (sale: any) => Promise<any>;
  getSales: () => Promise<any>;
  getSaleById: (id: string) => Promise<any>;

  // POS Session
  getCurrentSession: () => Promise<any>;
  openSession: () => Promise<any>;
  closeSession: () => Promise<any>;
  setPOSSession: (data: any) => Promise<any>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
