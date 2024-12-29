import axios, { AxiosInstance } from 'axios';
import { getConfig } from './config';
import { User, UserRole, POSProfile, ERPNextConfig } from '@/types';

export class ERPNextService {
  private static instance: ERPNextService;
  private axiosInstance: AxiosInstance;
  private posProfile: POSProfile | null = null;
  private config: ERPNextConfig;

  private constructor(config: ERPNextConfig) {
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

  getCurrentPOSProfile(): POSProfile | null {
    return this.posProfile;
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  async syncAll(): Promise<{ success: boolean; error?: string }> {
    try {
      // Sync POS Profile first as it contains important settings
      await this.getPOSProfile();

      // Sync items with proper batches and serial numbers
      const items = await this.syncItems();
      
      // Sync customers
      const customers = await this.syncCustomers();
      
      // Sync payment methods
      const payments = await this.syncPaymentMethods();
      
      // Sync tax templates
      const taxes = await this.syncTaxTemplates();

      // Sync price lists
      const priceLists = await this.syncPriceLists();

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Sync failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to sync with ERPNext'
      };
    }
  }

  private async syncItems(): Promise<any[]> {
    const response = await this.axiosInstance.get('/api/method/erpnext.stock.get_all_items', {
      params: {
        warehouse: this.posProfile?.warehouse,
        price_list: this.posProfile?.price_list
      }
    });
    return response.data.message || [];
  }

  private async syncCustomers(): Promise<any[]> {
    const response = await this.axiosInstance.get('/api/method/erpnext.selling.get_customers', {
      params: {
        territory: this.posProfile?.territory
      }
    });
    return response.data.message || [];
  }

  private async syncPaymentMethods(): Promise<any[]> {
    const response = await this.axiosInstance.get('/api/method/erpnext.accounts.get_payment_methods', {
      params: {
        pos_profile: this.posProfile?.name
      }
    });
    return response.data.message || [];
  }

  private async syncTaxTemplates(): Promise<any[]> {
    const response = await this.axiosInstance.get('/api/method/erpnext.accounts.get_tax_templates', {
      params: {
        company: this.posProfile?.company
      }
    });
    return response.data.message || [];
  }

  private async syncPriceLists(): Promise<any[]> {
    const response = await this.axiosInstance.get('/api/method/erpnext.stock.get_price_lists', {
      params: {
        company: this.posProfile?.company
      }
    });
    return response.data.message || [];
  }
}
