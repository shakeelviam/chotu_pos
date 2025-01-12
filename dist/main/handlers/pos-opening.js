"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPOSOpeningHandlers = registerPOSOpeningHandlers;
const electron_1 = require("electron");
const database_1 = require("../database");
const erpnext_1 = require("../services/erpnext");
function registerPOSOpeningHandlers() {
    electron_1.ipcMain.handle('getCompanies', async () => {
        try {
            const erpnext = await (0, erpnext_1.getERPNextService)();
            const response = await erpnext.getAxiosInstance().get('/api/resource/Company', {
                params: {
                    fields: JSON.stringify(['name', 'company_name', 'default_currency', 'currency'])
                }
            });
            const companies = response.data.data.map((company) => ({
                name: company.name,
                label: company.company_name,
                currency: company.currency,
                default_currency: company.default_currency
            }));
            return {
                success: true,
                companies
            };
        }
        catch (error) {
            console.error('Failed to get companies:', error);
            return {
                success: false,
                error: error.message || 'Failed to get companies'
            };
        }
    });
    electron_1.ipcMain.handle('getPaymentMethods', async () => {
        try {
            const erpnext = await (0, erpnext_1.getERPNextService)();
            const response = await erpnext.getAxiosInstance().get('/api/resource/Mode of Payment', {
                params: {
                    fields: JSON.stringify(['name', 'type', 'accounts', 'default'])
                }
            });
            const methods = response.data.data.map((method) => ({
                name: method.name,
                type: method.type,
                default: method.default || false,
                account: method.accounts?.[0]?.default_account
            }));
            return {
                success: true,
                methods
            };
        }
        catch (error) {
            console.error('Failed to get payment methods:', error);
            return {
                success: false,
                error: error.message || 'Failed to get payment methods'
            };
        }
    });
    electron_1.ipcMain.handle('getPOSProfiles', async (_, company) => {
        try {
            const erpnext = await (0, erpnext_1.getERPNextService)();
            const response = await erpnext.getAxiosInstance().get('/api/resource/POS Profile', {
                params: {
                    filters: JSON.stringify([['company', '=', company]]),
                    fields: JSON.stringify(['name', 'warehouse', 'payments'])
                }
            });
            const profiles = response.data.data.map((profile) => ({
                name: profile.name,
                label: profile.name,
                warehouse: profile.warehouse,
                payments: profile.payments
            }));
            return {
                success: true,
                profiles
            };
        }
        catch (error) {
            console.error('Failed to get POS profiles:', error);
            return {
                success: false,
                error: error.message || 'Failed to get POS profiles'
            };
        }
    });
    electron_1.ipcMain.handle('createPOSOpening', async (_, data) => {
        const db = (0, database_1.getDatabase)();
        try {
            const erpnext = await (0, erpnext_1.getERPNextService)();
            const response = await erpnext.createPOSOpeningEntry({
                company: data.company,
                pos_profile: data.posProfile,
                balance_details: data.balanceDetails.map((detail) => ({
                    mode_of_payment: detail.modeOfPayment,
                    opening_amount: detail.openingAmount
                }))
            });
            if (response.success && response.session_id) {
                const now = new Date().toISOString();
                const entry = {
                    id: response.session_id,
                    user: 'current_user',
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
        `).run(entry.id, entry.user, entry.opening_time, entry.status, JSON.stringify(entry.balance_details), entry.pos_profile, entry.created_at, entry.updated_at);
                return {
                    success: true,
                    entry
                };
            }
            throw new Error(response.error || 'Failed to create POS opening entry');
        }
        catch (error) {
            console.error('Failed to create POS opening:', error);
            return {
                success: false,
                error: error.message || 'Failed to create POS opening entry'
            };
        }
    });
    electron_1.ipcMain.handle('getCurrentPOSEntry', async () => {
        const db = (0, database_1.getDatabase)();
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
        }
        catch (error) {
            console.error('Failed to get current POS entry:', error);
            return {
                success: false,
                error: error.message || 'Failed to get current POS entry'
            };
        }
    });
}
//# sourceMappingURL=pos-opening.js.map