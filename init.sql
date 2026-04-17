-- 创建账户表
CREATE TABLE IF NOT EXISTS accounts (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(50) NOT NULL,
    currency char(3) DEFAULT 'CNY',
    created_at timestamptz DEFAULT now()
);

-- 插入默认账户（如果不存在）
INSERT INTO accounts (name) 
SELECT '现金' WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE id = 1);

INSERT INTO accounts (name) 
SELECT '支付宝' WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE id = 2);

INSERT INTO accounts (name) 
SELECT '信用卡' WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE id = 3);

-- 创建交易表（带分区，展示你学的技能）
CREATE TABLE IF NOT EXISTS transactions (
    id bigserial,
    account_id integer REFERENCES accounts(id),
    amount numeric(12,2) NOT NULL,
    category varchar(50),
    trans_date date NOT NULL,
    created_at timestamptz DEFAULT now()
) PARTITION BY RANGE (trans_date);

-- 创建默认分区（防止插入失败）
CREATE TABLE IF NOT EXISTS transactions_default PARTITION OF transactions DEFAULT;

-- 创建本月分区（自动）
CREATE TABLE IF NOT EXISTS transactions_2024_03 PARTITION OF transactions
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');

-- 创建索引（展示 B-Tree 和性能优化）
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(trans_date);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);