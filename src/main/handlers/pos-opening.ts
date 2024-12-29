import { ipcMain } from 'electron';
import { getDatabase } from '../database';
import { POSOpeningData } from '@/shared/types';

export function registerPOSOpeningHandlers() {
  ipcMain.handle('pos:createOpening', async (_, openingData: POSOpeningData) => {
    const db = getDatabase();
    
    try {
      return db.transaction(() => {
        // Get current session
        const session = db.prepare(`
          SELECT * FROM pos_sessions 
          WHERE closing_time IS NULL 
          ORDER BY opening_time DESC 
          LIMIT 1
        `).get();
        
        if (!session) {
          return { 
            success: false, 
            error: 'No active POS session found. Please start a new session first.' 
          };
        }

        if (session.opening_balance !== null) {
          return { 
            success: false, 
            error: 'Opening balance already set for this session.' 
          };
        }

        const totalAmount = openingData.cashAmount + openingData.knetAmount;

        // Update session with opening balance
        db.prepare(`
          UPDATE pos_sessions 
          SET 
            opening_balance = ?,
            cash_amount = ?,
            knet_amount = ?,
            profile = ?
          WHERE id = ? AND opening_balance IS NULL
        `).run(
          totalAmount,
          openingData.cashAmount,
          openingData.knetAmount,
          openingData.profile,
          session.id
        );

        const updatedSession = db.prepare(`
          SELECT * FROM pos_sessions 
          WHERE id = ?
        `).get(session.id);

        if (!updatedSession || updatedSession.opening_balance === null) {
          throw new Error('Failed to update session opening balance');
        }

        return {
          success: true,
          opening: {
            sessionId: session.id,
            cashAmount: openingData.cashAmount,
            knetAmount: openingData.knetAmount,
            profile: openingData.profile,
            timestamp: new Date().toISOString()
          }
        };
      })();
    } catch (error) {
      console.error('Error creating POS opening:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create POS opening' 
      };
    }
  });
}
