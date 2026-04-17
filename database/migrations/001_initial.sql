-- database/migrations/001_initial.sql

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- 账户表
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'cash', 'alipay', 'wechat', 'card'
  currency CHAR(3) DEFAULT 'CNY',
  initial_balance DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  icon VARCHAR(50),
  color VARCHAR(7),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_accounts_user ON accounts(user_id);

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(10) NOT NULL, -- 'income', 'expense'
  icon VARCHAR(50),
  color VARCHAR(7),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_categories_user_type_name ON categories(user_id, type, name);

-- 交易表
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  account_id INTEGER REFERENCES accounts(id) ON DELETE RESTRICT,
  type VARCHAR(20) NOT NULL, -- 'income', 'expense', 'transfer'
  amount DECIMAL(12,2) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  note TEXT,
  trans_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (trans_date);

-- 按月分区
CREATE TABLE IF NOT EXISTS transactions_2024_04 PARTITION OF transactions
  FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');

CREATE TABLE IF NOT EXISTS transactions_2024_05 PARTITION OF transactions
  FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');

CREATE TABLE IF NOT EXISTS transactions_2024_06 PARTITION OF transactions
  FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');

CREATE INDEX idx_transactions_user_date ON transactions(user_id, trans_date DESC);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
