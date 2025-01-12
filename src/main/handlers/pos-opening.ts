import { ipcMain } from 'electron';
import { getDatabase } from '../database';
import { getERPNextService } from '../services/erpnext';
import { POSOpeningEntry, POSBalanceDetail } from '@/types';

export function registerPOSOpeningHandlers() {
  // Get companies
  ipcMain.handle('getCompanies', async () => {
    try {
      const erpnext = await getERPNextService();
      const response = await erpnext.getAxiosInstance().get('/api/resource/Company', {
        params: {
          fields: JSON.stringify(['name', 'company_name', 'default_currency', 'currency'])
        }
      });

      const companies = response.data.data.map((company: any) => ({
        name: company.name,
        label: company.company_name,
        currency: company.currency,
        default_currency: company.default_currency
      }));

      return {
        success: true,
        companies
      };
    } catch (error: any) {
      console.error('Failed to get companies:', error);
      return {
        success: false,
        error: error.message || 'Failed to get companies'
      };
    }
  });

  // Get payment methods
  ipcMain.handle('getPaymentMethods', async () => {
    try {
      const erpnext = await getERPNextService();
      const response = await erpnext.getAxiosInstance().get('/api/resource/Mode of Payment', {
        params: {
          fields: JSON.stringify(['name', 'type', 'accounts', 'default'])
        }
      });

      const methods = response.data.data.map((method: any) => ({
        name: method.name,
        type: method.type,
        default: method.default || false,
        account: method.accounts?.[0]?.default_account
      }));

      return {
        success: true,
        methods
      };
    } catch (error: any) {
      console.error('Failed to get payment methods:', error);
      return {
        success: false,
        error: error.message || 'Failed to get payment methods'
      };
    }
  });

  // Get POS profiles for company
  ipcMain.handle('getPOSProfiles', async (_, company: string) => {
    try {
      const erpnext = await getERPNextService();
      const response = await erpnext.getAxiosInstance().get('/api/resource/POS Profile', {
        params: {
          filters: JSON.stringify([['company', '=', company]]),
          fields: JSON.stringify(['name', 'warehouse', 'payments'])
        }
      });

      const profiles = response.data.data.map((profile: any) => ({
        name: profile.name,
        label: profile.name,
        warehouse: profile.warehouse,
        payments: profile.payments
      }));

      return {
        success: true,
        profiles
      };
    } catch (error: any) {
      console.error('Failed to get POS profiles:', error);
      return {
        success: false,
        error: error.message || 'Failed to get POS profiles'
      };
    }
  });

  // Create POS opening entry
  ipcMain.handle('createPOSOpening', async (_, data: any) => {
    const db = getDatabase();
    try {
      // Create in ERPNext first
      const erpnext = await getERPNextService();
      const response = await erpnext.createPOSOpeningEntry({
        company: data.company,
        pos_profile: data.posProfile,
        balance_details: data.balanceDetails.map((detail: any) => ({
          mode_of_payment: detail.modeOfPayment,
          opening_amount: detail.openingAmount
        }))
      });

      if (response.success && response.session_id) {
        // Store locally
        const now = new Date().toISOString();
        const entry: POSOpeningEntry = {
          id: response.session_id,
          user: 'current_user', // Get from auth service
          company: data.company,
          pos_profile: data.posProfile,
          status: 'Open',
          opening_time: now,
          balance_details: data.balanceDetails,
          created_at: now,
          updated_at: now
        };

        db.prepare(`
          INSERT INTO pos_sessions (
            id, user, opening_time, status, opening_balance, profile,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          entry.id,
          entry.user,
          entry.opening_time,
          entry.status,
          JSON.stringify(entry.balance_details),
          entry.pos_profile,
          entry.created_at,
          entry.updated_at
        );

        return {
          success: true,
          entry
        };
      }

      throw new Error(response.error || 'Failed to create POS opening entry');
    } catch (error: any) {
      console.error('Failed to create POS opening:', error);
      return {
        success: false,
        error: error.message || 'Failed to create POS opening entry'
      };
    }
  });

  // Get current POS entry
  ipcMain.handle('getCurrentPOSEntry', async () => {
    const db = getDatabase();
    try {
      const entry = db.prepare(`
        SELECT * FROM pos_sessions
        WHERE status = 'Open'
        ORDER BY opening_time DESC
        LIMIT 1
      `).get();

      if (!entry) {
        return {
          success: true,
          entry: null
        };
      }

      return {
        success: true,
        entry: {
          ...entry,
          balance_details: JSON.parse(entry.opening_balance)
        }
      };
    } catch (error: any) {
      console.error('Failed to get current POS entry:', error);
      return {
        success: false,
        error: error.message || 'Failed to get current POS entry'
      };
    }
  });
}