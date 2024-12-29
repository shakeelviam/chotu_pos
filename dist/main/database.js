"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabase = getDatabase;
exports.initDatabase = initDatabase;
exports.closeDatabase = closeDatabase;
const path = require("path");
const electron_1 = require("electron");
const Database = require('better-sqlite3');
let db;
function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
}
function initDatabase() {
    const dbPath = path.join(electron_1.app.getPath('userData'), 'pos.db');
    console.log('Initializing database at:', dbPath);
    db = new Database(dbPath);
    db.pragma('foreign_keys = ON');
    db.transaction(() => {
        db.prepare(`
      CREATE TABLE IF NOT EXISTS items (
        item_code TEXT PRIMARY KEY,
        item_name TEXT NOT NULL,
        description TEXT,
        standard_rate REAL NOT NULL,
        current_stock INTEGER NOT NULL DEFAULT 0,
        barcode TEXT
      )
    `).run();
        db.prepare(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        mobile TEXT UNIQUE NOT NULL
      )
    `).run();
        db.prepare(`
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
        db.prepare(`
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
        db.prepare(`
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
        db.prepare(`
      CREATE TABLE IF NOT EXISTS sync_status (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        last_sync TEXT,
        items_synced BOOLEAN NOT NULL DEFAULT 0,
        customers_synced BOOLEAN NOT NULL DEFAULT 0,
        sales_synced BOOLEAN NOT NULL DEFAULT 0
      )
    `).run();
        db.prepare(`
      INSERT OR IGNORE INTO sync_status (id, last_sync)
      VALUES (1, datetime('now'))
    `).run();
    })();
    console.log('Database initialized successfully');
}
function closeDatabase() {
    if (db) {
        console.log('Closing database connection');
        db.close();
    }
}
//# sourceMappingURL=database.js.map