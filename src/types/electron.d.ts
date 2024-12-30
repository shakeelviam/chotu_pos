import { AuthResponse } from ".";

export interface IElectronAPI {
  // Window controls
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;

  // Auth
  login: (credentials: { username: string; password: string }) => Promise<AuthResponse>;
  adminLogin: (credentials: { username: string; password: string }) => Promise<AuthResponse>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  getSettings: () => Promise<{ success: boolean; settings?: any; error?: string }>;
  getCurrentUser: () => Promise<{ success: boolean; user?: { username: string; role: string } }>;
  verifyManager: (credentials: { username: string; password: string }) => Promise<{ success: boolean; error?: string }>;

  // Admin
  getERPNextConfig: () => Promise<{ success: boolean; config?: any; error?: string }>;
  saveERPNextConfig: (config: any) => Promise<{ success: boolean; error?: string }>;
  testERPNextConnection: (config: any) => Promise<{ success: boolean; error?: string }>;
  getRoleConfigs: () => Promise<{ success: boolean; configs?: any[]; error?: string }>;
  saveRoleConfig: (config: any) => Promise<{ success: boolean; error?: string }>;
  deleteRoleConfig: (role: string) => Promise<{ success: boolean; error?: string }>;
  getSystemConfig: () => Promise<{ success: boolean; config?: any; error?: string }>;
  saveSystemConfig: (config: any) => Promise<{ success: boolean; error?: string }>;
  getSystemLogs: (filters?: { level?: string }) => Promise<{ success: boolean; logs?: any[]; error?: string }>;
  clearSystemLogs: () => Promise<{ success: boolean; error?: string }>;
  exportSystemLogs: () => Promise<{ success: boolean; filePath?: string; error?: string }>;
  getPOSProfiles: () => Promise<{ success: boolean; profiles?: any[]; error?: string }>;

  // Items
  getItems: () => Promise<{
    success: boolean;
    items?: Array<{
      item_code: string;
      item_name: string;
      barcode: string | null;
      standard_rate: number;
      image_url: string | null;
      current_stock: number;
      last_sync: string;
    }>;
    error?: string;
  }>;
  searchItems: (query: string) => Promise<{
    success: boolean;
    items?: Array<{
      item_code: string;
      item_name: string;
      barcode: string | null;
      standard_rate: number;
      image_url: string | null;
    }>;
    error?: string;
  }>;
  getItem: (itemCode: string) => Promise<{
    success: boolean;
    item?: any;
    error?: string;
  }>;
  updateItem: (itemCode: string, updates: any) => Promise<{
    success: boolean;
    error?: string;
  }>;

  // Sales
  createSale: (sale: any) => Promise<{
    success: boolean;
    sale?: any;
    error?: string;
  }>;
  getSales: () => Promise<{
    success: boolean;
    sales?: any[];
    error?: string;
  }>;
  getSale: (id: string) => Promise<{
    success: boolean;
    sale?: any;
    error?: string;
  }>;

  // Customers
  getCustomers: () => Promise<{
    success: boolean;
    customers?: any[];
    error?: string;
  }>;
  searchCustomers: (query: string) => Promise<{
    success: boolean;
    customers?: any[];
    error?: string;
  }>;
  createCustomer: (customer: any) => Promise<{
    success: boolean;
    customer?: any;
    error?: string;
  }>;

  // POS Session
  getCurrentSession: () => Promise<{
    success: boolean;
    session?: any;
    error?: string;
  }>;
  openSession: () => Promise<{
    success: boolean;
    session?: any;
    error?: string;
  }>;
  closeSession: () => Promise<{
    success: boolean;
    error?: string;
  }>;
  createPOSOpening: (data: { cashAmount: number; knetAmount: number; profile: string }) => Promise<{
    success: boolean;
    opening?: any;
    error?: string;
  }>;
  endSession: () => Promise<{
    success: boolean;
    error?: string;
  }>;
  getSessions: () => Promise<{
    success: boolean;
    sessions?: any[];
    error?: string;
  }>;
  getSessionById: (id: number) => Promise<{
    success: boolean;
    session?: any;
    error?: string;
  }>;

  // Sync
  syncItems: () => Promise<{
    success: boolean;
    error?: string;
  }>;
  syncAll: () => Promise<{
    success: boolean;
    error?: string;
  }>;
  getSyncStatus: () => Promise<{
    success: boolean;
    status?: any;
    error?: string;
  }>;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}
