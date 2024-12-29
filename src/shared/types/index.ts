// Basic types
export type UserRole = 'admin' | 'manager' | 'cashier';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'split';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface User {
  username: string;
  role: UserRole;
}

export interface Settings {
  currency: string;
  currency_symbol: string;
  currency_precision: number;
  currency_format: string;
}

export interface Item {
  item_code: string;
  item_name: string;
  description: string;
  standard_rate: number;
  current_stock: number;
  barcode: string;
}

export interface Customer {
  id: number;
  name: string;
  mobile: string;
}

export interface Payment {
  method: PaymentMethod;
  amount: number;
  approval_code?: string; // Required for bank payments
  reference?: string;
}

export interface SplitPayment {
  payments: Payment[];
  total_amount: number;
}

export interface Sale {
  id: string;
  customer_id: number;
  items: Array<{
    item_code: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  total_amount: number;
  payment: Payment | SplitPayment;
  status: PaymentStatus;
  created_at: string;
}

export interface POSSession {
  id: string;
  user: string;
  opening_time: string;
  closing_time?: string;
  status: 'open' | 'closed';
  opening_balance: number;
  closing_balance?: number;
  sales: Sale[];
}

export interface SyncStatus {
  last_sync: string;
  items_synced: boolean;
  customers_synced: boolean;
  sales_synced: boolean;
}

export interface POSOpeningData {
  cashAmount: number;
  knetAmount: number;
  profile: string;
}

// Response types
export interface AuthResponse {
  success: boolean;
  user?: User;
  settings?: Settings;
  error?: string;
}

export interface SettingsResponse {
  success: boolean;
  settings?: Settings;
  error?: string;
}

export interface ItemsResponse {
  success: boolean;
  items?: Item[];
  error?: string;
}

export interface CustomerResponse {
  success: boolean;
  customer?: Customer;
  error?: string;
}

export interface CustomersResponse {
  success: boolean;
  customers?: Customer[];
  error?: string;
}

export interface SaleResponse {
  success: boolean;
  sale?: Sale;
  error?: string;
}

export interface POSSessionResponse {
  success: boolean;
  session?: POSSession;
  error?: string;
}

export interface SyncResponse {
  success: boolean;
  status?: SyncStatus;
  error?: string;
}

// Electron API interface
export interface ElectronAPI {
  // Window controls
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;

  // Auth
  login: (credentials: { username: string; password: string }) => Promise<AuthResponse>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  getSettings: () => Promise<SettingsResponse>;
  getCurrentUser: () => Promise<User | null>;

  // Items
  getItems: () => Promise<ItemsResponse>;
  searchItems: (query: string) => Promise<ItemsResponse>;
  getItem: (itemCode: string) => Promise<{ success: boolean; item?: Item; error?: string }>;
  updateItem: (itemCode: string, updates: any) => Promise<{ success: boolean; item?: Item; error?: string }>;

  // Sales
  createSale: (sale: any) => Promise<{ success: boolean; saleId?: string; error?: string }>;
  getSales: () => Promise<{ success: boolean; sales: Sale[]; error?: string }>;
  getSale: (id: string) => Promise<{ success: boolean; sale?: Sale; error?: string }>;

  // Customers
  getCustomers: () => Promise<CustomersResponse>;
  searchCustomers: (query: string) => Promise<CustomersResponse>;
  createCustomer: (customer: any) => Promise<CustomerResponse>;

  // Sync
  syncItems: () => Promise<{ success: boolean; error?: string }>;
  syncCustomers: () => Promise<{ success: boolean; error?: string }>;
  getSyncStatus: () => Promise<SyncResponse>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
