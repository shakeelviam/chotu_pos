-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  mobile TEXT UNIQUE,
  civil_id TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  item_code TEXT PRIMARY KEY,
  item_name TEXT NOT NULL,
  description TEXT,
  standard_rate REAL NOT NULL,
  current_stock INTEGER DEFAULT 0,
  barcode TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER,
  total_amount REAL NOT NULL,
  payment_method TEXT NOT NULL,
  payment_details TEXT NOT NULL,
  status TEXT NOT NULL,
  synced BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers (id)
);

-- Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER NOT NULL,
  item_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  rate REAL NOT NULL,
  amount REAL NOT NULL,
  discount REAL,
  discount_type TEXT CHECK (discount_type IN ('amount', 'percentage') OR discount_type IS NULL),
  original_amount REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales (id),
  FOREIGN KEY (item_code) REFERENCES items (item_code)
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  opening_balance REAL NOT NULL,
  closing_balance REAL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME
);

-- Create opening_balance table
CREATE TABLE IF NOT EXISTS opening_balance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions (id)
);

-- Create role_configs table
CREATE TABLE IF NOT EXISTS role_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL UNIQUE,
  pos_profile TEXT NOT NULL,
  max_discount_percent REAL NOT NULL DEFAULT 0,
  max_discount_amount REAL NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create system_logs table
CREATE TABLE IF NOT EXISTS system_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create system_config table
CREATE TABLE IF NOT EXISTS system_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  offline_mode_enabled BOOLEAN DEFAULT FALSE,
  offline_max_storage INTEGER DEFAULT 1000,
  offline_sync_priority TEXT DEFAULT '[]',
  backup_enabled BOOLEAN DEFAULT FALSE,
  backup_frequency INTEGER DEFAULT 24,
  backup_retention_days INTEGER DEFAULT 7,
  debug_enabled BOOLEAN DEFAULT FALSE,
  debug_log_level TEXT DEFAULT 'info',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create erpnext_config table
CREATE TABLE IF NOT EXISTS erpnext_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  api_secret TEXT NOT NULL,
  use_mock_data BOOLEAN DEFAULT FALSE,
  sync_interval INTEGER DEFAULT 30,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
