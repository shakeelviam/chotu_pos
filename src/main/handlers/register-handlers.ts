// src/main/handlers/register-handlers.ts
import { Database } from '../services/database';
import { Config } from '../services/config';
import { registerAuthHandlers } from './auth';
import { registerInventoryHandlers } from './inventory';
import { registerPOSHandlers } from './pos';
import { registerSalesHandlers } from './sales';
import { registerSyncHandlers } from './sync';
import { registerPOSOpeningHandlers } from './pos-opening';
import { registerPOSClosingHandlers } from './pos-closing';
import { registerConfigHandlers } from './config';
import { registerAdminHandlers } from './admin';

export function registerAllHandlers(db: Database, config: Config) {
  registerAuthHandlers();
  registerInventoryHandlers();
  registerPOSHandlers();
  registerSalesHandlers();
  registerSyncHandlers();
  registerPOSOpeningHandlers();
  registerPOSClosingHandlers(); // Added this line
  registerConfigHandlers();
  registerAdminHandlers();
}