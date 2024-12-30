import * as path from 'path';
import { app } from 'electron';
const BetterSqlite3 = require('better-sqlite3');

export class Database {
  private static instance: Database;
  private db: any;

  private constructor() {
    const dbPath = path.join(app.getPath('userData'), 'pos.db');
    console.log('Initializing database at:', dbPath);
    
    this.db = new BetterSqlite3(dbPath);
    this.init();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private init() {
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');

    // Create tables if they don't exist
    this.db.transaction(() => {
      // Items table
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS items (
          item_code TEXT PRIMARY KEY,
          item_name TEXT NOT NULL,
          description TEXT,
          standard_rate REAL NOT NULL,
          current_stock INTEGER NOT NULL DEFAULT 0,
          barcode TEXT
        )
      `).run();

      // Customers table
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          mobile TEXT UNIQUE NOT NULL
        )
      `).run();

      // POS Sessions table
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS pos_sessions (
          id TEXT PRIMARY KEY,
          user TEXT NOT NULL,
          opening_time TEXT NOT NULL,
          closing_time TEXT,
          status TEXT NOT NULL,
          opening_balance REAL,
          closing_balance REAL,
          cash_amount REAL,
          knet_amount REAL,
          profile TEXT
        )
      `).run();

      // Sales table
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS sales (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER NOT NULL,
          total_amount REAL NOT NULL,
          payment_method TEXT NOT NULL,
          payment_details TEXT NOT NULL,
          status TEXT NOT NULL,
          synced BOOLEAN NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          FOREIGN KEY (customer_id) REFERENCES customers (id)
        )
      `).run();

      // Sale items table
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS sale_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sale_id INTEGER NOT NULL,
          item_code TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          rate REAL NOT NULL,
          amount REAL NOT NULL,
          FOREIGN KEY (sale_id) REFERENCES sales (id),
          FOREIGN KEY (item_code) REFERENCES items (item_code)
        )
      `).run();

      // Sync status table
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS sync_status (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          last_sync TEXT,
          items_synced BOOLEAN NOT NULL DEFAULT 0,
          customers_synced BOOLEAN NOT NULL DEFAULT 0,
          sales_synced BOOLEAN NOT NULL DEFAULT 0
        )
      `).run();

      // Insert default sync status if not exists
      this.db.prepare(`
        INSERT OR IGNORE INTO sync_status (id, last_sync)
        VALUES (1, datetime('now'))
      `).run();
    })();
  }

  prepare(sql: string) {
    return this.db.prepare(sql);
  }

  transaction(fn: Function) {
    return this.db.transaction(fn);
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

// Export a function to get the database instance
export function getDatabase() {
  return Database.getInstance();
}
