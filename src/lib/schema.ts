/**
 * Database Schema for Golden Base AI Builder
 * Uses SQLite for simplicity, can migrate to PostgreSQL
 */

export const schema = `
-- Users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fid INTEGER UNIQUE NOT NULL,
  username TEXT,
  address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('starter', 'growth', 'pro', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'expired', 'past_due')),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ends_at DATETIME,
  credits_per_month INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Credit Transactions
CREATE TABLE IF NOT EXISTS credit_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus', 'subscription')),
  description TEXT,
  related_id TEXT, -- app_id, connector_id, etc.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Apps
CREATE TABLE IF NOT EXISTS apps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  app_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  template_id TEXT,
  has_contract BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Connectors
CREATE TABLE IF NOT EXISTS connectors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  connector_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  developer_id INTEGER,
  oauth_url TEXT,
  webhook_url TEXT,
  price_per_use INTEGER NOT NULL DEFAULT 10,
  revenue_share INTEGER DEFAULT 60, -- % for developer
  status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'disabled')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (developer_id) REFERENCES users(id)
);

-- User Connectors (OAuth authorizations)
CREATE TABLE IF NOT EXISTS user_connectors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  connector_id INTEGER NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at DATETIME,
  scope TEXT,
  authorized_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (connector_id) REFERENCES connectors(id),
  UNIQUE(user_id, connector_id)
);

-- Connector Usage
CREATE TABLE IF NOT EXISTS connector_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_connector_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  credits_used INTEGER NOT NULL,
  developer_earned INTEGER NOT NULL,
  platform_earned INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_connector_id) REFERENCES user_connectors(id)
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  method TEXT NOT NULL CHECK (method IN ('stripe', 'crypto', 'credits', 'frame')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT UNIQUE,
  crypto_transaction_hash TEXT UNIQUE,
  credits_purchased INTEGER,
  subscription_id INTEGER,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);

-- Developer Earnings
CREATE TABLE IF NOT EXISTS developer_earnings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  developer_id INTEGER NOT NULL,
  connector_id INTEGER,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payout_status TEXT NOT NULL CHECK (payout_status IN ('pending', 'processing', 'paid', 'failed')),
  payout_method TEXT,
  payout_address TEXT,
  payout_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (developer_id) REFERENCES users(id),
  FOREIGN KEY (connector_id) REFERENCES connectors(id)
);

-- Marketplace Listings
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  app_id INTEGER,
  connector_id INTEGER,
  type TEXT NOT NULL CHECK (type IN ('app', 'connector')),
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0, -- 0 = free
  category TEXT,
  tags TEXT,
  image_url TEXT,
  downloads INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('published', 'pending', 'disabled')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (app_id) REFERENCES apps(id),
  FOREIGN KEY (connector_id) REFERENCES connectors(id)
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  listing_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (listing_id) REFERENCES marketplace_listings(id),
  UNIQUE(user_id, listing_id)
);

-- Analytics
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id INTEGER,
  user_id INTEGER,
  event_type TEXT NOT NULL,
  event_data JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (app_id) REFERENCES apps(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Token Deployments (Flaunch integration)
CREATE TABLE IF NOT EXISTS token_deployments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  launch_id INTEGER,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  token_address TEXT,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'launched', 'failed')),
  creator_address TEXT,
  platform_fee_percent INTEGER DEFAULT 20,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_fid ON users(fid);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_apps_user_id ON apps(user_id);
CREATE INDEX IF NOT EXISTS idx_connector_usage_user_connector_id ON connector_usage(user_connector_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_type ON marketplace_listings(type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_app_id ON analytics_events(app_id);
`;
