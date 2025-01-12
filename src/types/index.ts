export type UserRole = 'super_admin' | 'admin' | 'manager' | 'cashier';

export interface User {
  id?: string;
  username: string;
  role: UserRole;
  erpnextUser?: boolean;
}

export interface POSUser {
  id: string;
  username: string;
  password: string; // Hashed
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id?: number;
  name: string;
  mobile: string;
  email?: string;
  tax_id?: string;
  loyalty_program?: string;
  loyalty_points?: number;
  customer_group?: string;
  territory?: string;
  erpnext_id?: string;
  synced: boolean;
  created_at: string;
  updated_at: string;
}

export interface ERPNextCustomer {
  name: string;
  customer_name: string;
  mobile_no: string;
  email_id?: string;
  tax_id?: string;
  loyalty_program?: string;
  loyalty_points?: number;
  customer_group?: string;
  territory?: string;
}

export interface Item {
  item_code: string;
  item_name: string;
  description?: string;
  item_group?: string;
  brand?: string;
  barcode?: string;
  standard_rate: number;
  stock_uom?: string;
  uom?: string;
  conversion_factor?: number;
  current_stock?: number;
  actual_qty?: number;
  projected_qty?: number;
  reserved_qty?: number;
  has_serial_no?: boolean;
  has_batch_no?: boolean;
  image?: string;
  thumbnail?: string;
  is_stock_item?: boolean;
  tax_rate?: number;
  tax_template?: string;
  synced?: boolean;
  created_at?: string;
  updated_at?: string;
  is_scale_item?: boolean;
  scale_uom?: string;
  weight_per_unit?: number;
  scale_item_code?: string;
}

export interface CartItem {
  item_code: string;
  item_name: string;
  standard_rate: number;
  rate: number;  // Actual rate after discount
  quantity: number;
  discount_percentage: number;
  discount_amount: number;
  amount: number;  // Final amount after discount
  uom: string;
  conversion_factor: number;
  actual_qty?: number;  // Available quantity
  batch_no?: string;
  serial_no?: string;
  tax_template?: string;
  has_batch_no: boolean;
  has_serial_no: boolean;
  allow_rate_change: boolean;
  item_group?: string;
}

export interface POSProfile {
  name: string;
  warehouse: string;
  company: string;
  customer?: string;
  territory?: string;
  campaign?: string;
  write_off_account?: string;
  write_off_cost_center?: string;
  account_for_change_amount?: string;
  taxes_and_charges?: string;
  tax_category?: string;
  apply_discount_on?: 'Grand Total' | 'Net Total';
  currency: string;
  price_list: string;
  payments?: Array<{
    mode_of_payment: string;
    default: boolean;
    account?: string;
    allow_in_returns?: boolean;
  }>;
  selling_price_list?: string;
  print_format?: string;
  letter_head?: string;
  tc_name?: string;
  select_print_heading?: string;
  cash_bank_account?: string;
  ignore_pricing_rule?: boolean;
  update_stock?: boolean;
}

export interface POSInvoice {
  id?: number;
  name?: string;
  posting_date: string;
  posting_time: string;
  customer: string;
  customer_name?: string;
  total: number;
  grand_total: number;
  net_total: number;
  tax_amount?: number;
  discount_amount?: number;
  rounding_adjustment?: number;
  status?: 'Draft' | 'Paid' | 'Consolidated' | 'Return' | 'Cancelled';
  is_return?: boolean;
  return_against?: string;
  pos_profile: string;
  company: string;
  warehouse: string;
  currency: string;
  conversion_rate?: number;
  selling_price_list?: string;
  price_list_currency?: string;
  plc_conversion_rate?: number;
  ignore_pricing_rule?: boolean;
  items: CartItem[];
  payments: Array<{
    mode_of_payment: string;
    amount: number;
    account?: string;
    type?: string;
    base_amount?: number;
  }>;
  taxes?: Array<{
    charge_type?: string;
    account_head?: string;
    description?: string;
    rate?: number;
    tax_amount?: number;
    total?: number;
    tax_type?: string;
  }>;
  loyalty_program?: string;
  loyalty_points?: number;
  loyalty_amount?: number;
  redeem_loyalty_points?: boolean;
  synced?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ERPNextConfig {
  url: string;
  api_key: string;
  api_secret: string;
  useMockData?: boolean;
  syncInterval?: number;
}

export interface Settings {
  currency: string;
  currency_symbol: string;
  currency_precision: number;
  currency_format: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  settings?: Settings;
  error?: string;
}

export interface POSOpeningEntry {
  id?: string;
  user: string;
  company: string;
  pos_profile: string;
  status: 'Open' | 'Closed';
  opening_time: string;
  closing_time?: string;
  balance_details: POSBalanceDetail[];
  created_at: string;
  updated_at: string;
}

export interface POSBalanceDetail {
  mode_of_payment: string;
  opening_amount: number;
  expected_amount?: number;
  closing_amount?: number;
  difference?: number;
}

export interface PaymentMethod {
  name: string;
  type: string;
  default: boolean;
  account?: string;
}

export interface Company {
  name: string;
  label: string;
  currency: string;
  default_currency: string;
}

export interface POSClosingEntry {
  id?: string;
  pos_opening_entry: string;
  user: string;
  company: string;
  pos_profile: string;
  status: 'Draft' | 'Submitted';
  closing_time: string;
  closing_details: POSClosingDetail[];
  created_at: string;
  updated_at: string;
}

export interface POSClosingDetail {
  mode_of_payment: string;
  opening_amount: number;
  expected_amount: number;
  closing_amount: number;
  difference: number;
}

export interface POSSessionBalance {
  opening: POSBalanceDetail[];
  expected: POSClosingDetail[];
  sales: Array<{
    payment_method: string;
    total_amount: number;
  }>;
}

export interface ElectronAPI {
  login: (credentials: { username: string; password: string }) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  getCompanies: () => Promise<{
    success: boolean;
    companies?: Company[];
    error?: string;
  }>;
  getPaymentMethods: () => Promise<{
    success: boolean;
    methods?: PaymentMethod[];
    error?: string;
  }>;
  getPOSProfiles: (company: string) => Promise<{
    success: boolean;
    profiles?: POSProfile[];
    error?: string;
  }>;
  createPOSOpening: (data: Omit<POSOpeningEntry, 'id' | 'user' | 'status' | 'opening_time' | 'created_at' | 'updated_at'>) => Promise<{
    success: boolean;
    entry?: POSOpeningEntry;
    error?: string;
  }>;
  getCurrentPOSEntry: () => Promise<{
    success: boolean;
    entry?: POSOpeningEntry;
    error?: string;
  }>;
  getCurrentBalance: () => Promise<{
    success: boolean;
    balance?: POSSessionBalance;
    error?: string;
  }>;
  createPOSClosing: (data: {
    pos_opening_entry: string;
    closing_details: POSClosingDetail[];
  }) => Promise<{
    success: boolean;
    error?: string;
  }>;
}