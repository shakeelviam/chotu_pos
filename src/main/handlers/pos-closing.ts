// src/main/handlers/pos-closing.ts
import { ipcMain } from 'electron';
import { getDatabase } from '../database';
import { getERPNextService } from '../services/erpnext';
import { POSClosingEntry } from '@/types';

export function registerPOSClosingHandlers() {
  // Create POS closing entry
  ipcMain.handle('createPOSClosing', async (_, data: {
    pos_opening_entry: string;
    closing_details: Array<{
      mode_of_payment: string;
      closing_amount: number;
      expected_amount: number;
      difference: number;
    }>;
  }) => {
    const db = getDatabase();
    try {
      const erpnext = await getERPNextService();
      const response = await erpnext.createPOSClosingEntry(data);

      if (response.success) {
        // Update local session status
        const now = new Date().toISOString();

        db.prepare(`
          UPDATE pos_sessions
          SET status = 'Closed',
              closing_time = ?,
              closing_balance = ?,
              updated_at = ?
          WHERE id = ?
        `).run(
          now,
          JSON.stringify(data.closing_details),
          now,
          data.pos_opening_entry
        );

        return {
          success: true
        };
      }

      throw new Error(response.error || 'Failed to create POS closing entry');
    } catch (error: any) {
      console.error('Failed to create POS closing:', error);
      return {
        success: false,
        error: error.message || 'Failed to create POS closing entry'
      };
    }
  });

  // Get current session balance
  ipcMain.handle('getCurrentBalance', async () => {
    const db = getDatabase();
    try {
      const session = db.prepare(`
        SELECT * FROM pos_sessions
        WHERE status = 'Open'
        ORDER BY opening_time DESC
        LIMIT 1
      `).get();

      if (!session) {
        return {
          success: true,
          balance: null
        };
      }

      // Get total sales for each payment method
      const sales = db.prepare(`
        SELECT
          payment_method,
          SUM(amount) as total_amount
        FROM sales
        WHERE session_id = ?
        GROUP BY payment_method
      `).all(session.id);

      // Calculate expected amounts
      const openingBalance = JSON.parse(session.opening_balance);
      const expectedAmounts = openingBalance.map((opening: any) => {
        const salesTotal = sales.find(s => s.payment_method === opening.mode_of_payment)?.total_amount || 0;
        return {
          mode_of_payment: opening.mode_of_payment,
          opening_amount: opening.opening_amount,
          expected_amount: opening.opening_amount + salesTotal,
          difference: 0 // To be filled by user
        };
      });

      return {
        success: true,
        balance: {
          opening: openingBalance,
          expected: expectedAmounts,
          sales: sales
        }
      };
    } catch (error: any) {
      console.error('Failed to get current balance:', error);
      return {
        success: false,
        error: error.message || 'Failed to get current balance'
      };
    }
  });
}