import axios, { AxiosInstance } from 'axios';
import { getConfig } from './config';
import { User, UserRole, POSProfile, ERPNextConfig, POSInvoice } from '@/types';

export class ERPNextService {
  private static instance: ERPNextService;
  private axiosInstance: AxiosInstance;
  private posProfile: POSProfile | null = null;
  private config: ERPNextConfig;
  private currentSession: string | null = null;

  constructor(config: ERPNextConfig) {
    this.config = config;
    this.axiosInstance = axios.create({
      baseURL: config.url,
      headers: {
        'Authorization': `token ${config.api_key}:${config.api_secret}`,
        'Content-Type': 'application/json'
      }
    });
  }

  static async initialize(): Promise<ERPNextService> {
    if (!ERPNextService.instance) {
      const config = await getConfig();
      if (!config.url || !config.api_key || !config.api_secret) {
        throw new Error('ERPNext not configured');
      }
      ERPNextService.instance = new ERPNextService(config);
    }
    return ERPNextService.instance;
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  async authenticate(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await this.axiosInstance.post('/api/method/login', {
        usr: username,
        pwd: password
      });

      if (response.data.message === 'Logged In') {
        const userResponse = await this.axiosInstance.get('/api/method/frappe.auth.get_logged_user');
        const user = userResponse.data;

        // Get user permissions
        const permResponse = await this.axiosInstance.get(`/api/resource/User/${username}`);
        const userPerms = permResponse.data.data;

        let role: UserRole = 'cashier'; // Default role
        if (userPerms.roles.some((r: any) => r.role === 'System Manager')) {
          role = 'admin';
        } else if (userPerms.roles.some((r: any) => r.role === 'Sales Manager')) {
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
    } catch (error: any) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Authentication failed'
      };
    }
  }

  async createPOSOpeningEntry(data: {
    company: string;
    pos_profile: string;
    balance_details: Array<{
      mode_of_payment: string;
      opening_amount: number;
    }>;
  }): Promise<{ success: boolean; session_id?: string; error?: string }> {
    try {
      const response = await this.axiosInstance.post('/api/resource/POS Opening Entry', {
        doctype: 'POS Opening Entry',
        company: data.company,
        pos_profile: data.pos_profile,
        balance_details: data.balance_details,
        status: 'Open',
        posting_date: new Date().toISOString().split('T')[0],
      });

      if (response.data.data) {
        this.currentSession = response.data.data.name;
        return {
          success: true,
          session_id: response.data.data.name
        };
      }

      throw new Error('Failed to create POS Opening Entry');
    } catch (error: any) {
      console.error('POS Opening Entry error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create POS Opening Entry'
      };
    }
  }

  async createPOSClosingEntry(data: {
    pos_opening_entry: string;
    closing_details: Array<{
      mode_of_payment: string;
      closing_amount: number;
      expected_amount: number;
      difference: number;
    }>;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.axiosInstance.post('/api/resource/POS Closing Entry', {
        doctype: 'POS Closing Entry',
        pos_opening_entry: data.pos_opening_entry,
        closing_details: data.closing_details,
        posting_date: new Date().toISOString().split('T')[0],
        status: 'Submitted'
      });

      if (response.data.data) {
        this.currentSession = null;
        return { success: true };
      }

      throw new Error('Failed to create POS Closing Entry');
    } catch (error: any) {
      console.error('POS Closing Entry error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create POS Closing Entry'
      };
    }
  }

  async getCurrentPOSSession(): Promise<{ session_id?: string; error?: string }> {
    if (this.currentSession) {
      return { session_id: this.currentSession };
    }

    try {
      const response = await this.axiosInstance.get('/api/resource/POS Opening Entry', {
        params: {
          filters: JSON.stringify([
            ['status', '=', 'Open'],
            ['docstatus', '=', 1]
          ]),
          limit: 1
        }
      });

      if (response.data.data?.length > 0) {
        this.currentSession = response.data.data[0].name;
        return { session_id: this.currentSession };
      }

      return { error: 'No active POS session found' };
    } catch (error: any) {
      console.error('Get POS Session error:', error);
      return { error: error.response?.data?.message || 'Failed to get POS session' };
    }
  }

  async getPOSProfile(profileName?: string): Promise<POSProfile> {
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
    } catch (error: any) {
      console.error('Failed to get POS Profile:', error);
      throw error;
    }
  }

  async getPOSProfiles(): Promise<any[]> {
    try {
      if (this.config.useMockData) {
        return [
          { name: 'Retail POS', disabled: 0 },
          { name: 'Restaurant POS', disabled: 0 }
        ];
      }

      const response = await this.axiosInstance.get('/api/resource/POS Profile');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch POS profiles:', error);
      throw error;
    }
  }

  getCurrentPOSProfile(): POSProfile | null {
    return this.posProfile;
  }

  async syncAll(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.getPOSProfile();
      await this.syncItems();
      await this.syncCustomers();
      await this.syncPaymentMethods();
      await this.syncTaxTemplates();
      await this.syncPriceLists();
      await this.syncScaleItems();

      return { success: true };
    } catch (error: any) {
      console.error('Sync failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to sync with ERPNext'
      };
    }
  }

  async syncItems(): Promise<any[]> {
    const response = await this.axiosInstance.get('/api/method/erpnext.stock.get_all_items', {
      params: {
        warehouse: this.posProfile?.warehouse,
        price_list: this.posProfile?.price_list,
        fields: JSON.stringify([
          'name', 'item_name', 'item_code', 'standard_rate', 'stock_uom',
          'is_stock_item', 'has_batch_no', 'has_serial_no', 'item_group',
          'custom_scale_item_code'
        ])
      }
    });
    return response.data.message || [];
  }

  async syncScaleItems(): Promise<any[]> {
    const response = await this.axiosInstance.get('/api/method/erpnext.stock.get_all_items', {
      params: {
        warehouse: this.posProfile?.warehouse,
        price_list: this.posProfile?.price_list,
        filters: JSON.stringify([['item_group', '=', 'Weighed Items']]),
        fields: JSON.stringify([
          'name', 'item_name', 'item_code', 'standard_rate',
          'stock_uom', 'custom_scale_item_code'
        ])
      }
    });
    return response.data.message || [];
  }

  async getScaleItemDetails(itemCode: string): Promise<{
    success: boolean;
    data?: {
      item_code: string;
      scale_item_code: string;
      standard_rate: number;
      uom: string;
    };
    error?: string;
  }> {
    try {
      const response = await this.axiosInstance.get(`/api/resource/Item/${itemCode}`, {
        params: {
          fields: JSON.stringify([
            'item_code',
            'custom_scale_item_code',
            'standard_rate',
            'stock_uom',
            'item_group'
          ])
        }
      });

      const item = response.data.data;
      if (item && item.item_group === 'Weighed Items') {
        return {
          success: true,
          data: {
            item_code: item.item_code,
            scale_item_code: item.custom_scale_item_code,
            standard_rate: item.standard_rate,
            uom: item.stock_uom
          }
        };
      }

      throw new Error('Scale item details not found');
    } catch (error: any) {
      console.error('Failed to get scale item details:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get scale item details'
      };
    }
  }

  async parseScaleBarcode(barcode: string): Promise<{
    success: boolean;
    data?: {
      item_code: string;
      weight: number;
      rate: number;
      total: number;
    };
    error?: string;
  }> {
    try {
      // Format: PPPP WWWW RRRR
      const scaleItemCode = barcode.substring(0, 4);
      const weight = parseInt(barcode.substring(4, 8)) / 1000; // Convert to kg
      const rate = parseInt(barcode.substring(8, 12)) / 1000; // Convert to KWD with 3 decimals

      // Get item by scale item code
      const response = await this.axiosInstance.get('/api/resource/Item', {
        params: {
          filters: JSON.stringify([
            ['custom_scale_item_code', '=', scaleItemCode],
            ['item_group', '=', 'Weighed Items']
          ]),
          limit: 1
        }
      });

      if (response.data.data?.length > 0) {
        const item = response.data.data[0];
        return {
          success: true,
          data: {
            item_code: item.name,
            weight,
            rate,
            total: parseFloat((weight * rate).toFixed(3))
          }
        };
      }

      throw new Error('Scale item not found');
    } catch (error: any) {
      console.error('Failed to parse scale barcode:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to parse scale barcode'
      };
    }
  }

  async syncCustomers(): Promise<any[]> {
    const response = await this.axiosInstance.get('/api/method/erpnext.selling.get_customers', {
      params: {
        territory: this.posProfile?.territory
      }
    });
    return response.data.message || [];
  }

  async syncPaymentMethods(): Promise<any[]> {
    const response = await this.axiosInstance.get('/api/method/erpnext.accounts.get_payment_methods', {
      params: {
        pos_profile: this.posProfile?.name
      }
    });
    return response.data.message || [];
  }

  async syncTaxTemplates(): Promise<any[]> {
    const response = await this.axiosInstance.get('/api/method/erpnext.accounts.get_tax_templates', {
      params: {
        company: this.posProfile?.company
      }
    });
    return response.data.message || [];
  }

  async syncPriceLists(): Promise<any[]> {
    const response = await this.axiosInstance.get('/api/method/erpnext.stock.get_price_lists', {
      params: {
        company: this.posProfile?.company
      }
    });
    return response.data.message || [];
  }

  async syncInvoice(invoice: POSInvoice): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.axiosInstance.post('/api/resource/POS Invoice', {
        doctype: 'POS Invoice',
        ...invoice,
        docstatus: 1,
        is_pos: 1,
        pos_profile: this.posProfile?.name,
        created_at: invoice.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      return { success: true };
    } catch (error: any) {
      console.error('Invoice sync error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to sync invoice'
      };
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.axiosInstance.get('/api/method/frappe.auth.get_logged_user');
      return { success: true };
    } catch (error: any) {
      console.error('Connection test failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Connection test failed'
      };
    }
  }
}

export function getERPNextService(): Promise<ERPNextService> {
  return ERPNextService.initialize();
}