import { AuthResponse } from ".";

export interface IElectronAPI {
  login: (credentials: { username: string; password: string }) => Promise<AuthResponse>;
  getItems: () => Promise<any[]>;
  searchItems: (query: string) => Promise<any[]>;
  createSale: (sale: any) => Promise<any>;
  logout: () => Promise<void>;
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
}

interface ElectronAPI {
  // Auth
  login: (credentials: { username: string; password: string }) => Promise<AuthResponse>;
  logout: () => Promise<{
    success: boolean;
    error?: string;
  }>;
  verifyManager: (credentials: { username: string; password: string }) => Promise<{
    success: boolean;
    error?: string;
  }>;
  getCurrentUser: () => Promise<{
    username: string;
    role: string;
  } | null>;

  // Config & Admin
  getERPNextConfig: () => Promise<{
    success: boolean;
    config?: {
      url: string;
      api_key: string;
      api_secret: string;
    };
    error?: string;
  }>;
  saveERPNextConfig: (config: {
    url: string;
    api_key: string;
    api_secret: string;
  }) => Promise<{
    success: boolean;
    error?: string;
  }>;
  syncAll: () => Promise<{
    success: boolean;
    error?: string;
  }>;

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
      current_stock: number;
      last_sync: string;
    }>;
    error?: string;
  }>;
  syncInventory: () => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;

  // Sales
  createSale: (saleData: {
    total_amount: number;
    payment_method: string;
    customer_name: string;
    items: Array<{
      item_code: string;
      quantity: number;
      rate: number;
      amount: number;
    }>;
  }) => Promise<{
    success: boolean;
    sale_id?: number;
    error?: string;
  }>;
  syncSales: () => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;

  // Settings
  getSettings: () => Promise<{
    success: boolean;
    settings?: any;
    error?: string;
  }>;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}
