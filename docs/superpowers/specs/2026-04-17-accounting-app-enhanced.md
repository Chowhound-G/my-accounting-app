# 记账应用 - 增强版设计文档

**项目类型：** Next.js 全栈 Web 应用
**设计日期：** 2026-04-17
**复杂度：** 高级（企业级功能）
**技术栈：** Next.js 14 + PostgreSQL + Redis + ECharts + TailwindCSS

---

## 1. 项目概述

### 1.1 目标
构建一个**企业级**的个人/家庭财务管理平台，支持完整的财务生命周期管理、智能分析和协作功能。

### 1.2 核心功能模块

#### 基础模块
1. **用户系统** - 注册/登录、个人资料、偏好设置
2. **交易管理** - 完整的 CRUD、批量操作、导入导出
3. **账户管理** - 多币种账户、余额同步
4. **分类系统** - 自定义分类、图标、颜色

#### 高级模块
5. **预算管理** - 分类预算、月度预算、超支预警
6. **定期交易** - 周期性交易自动记录
7. **标签系统** - 多维度标签（项目、地点、人物）
8. **借还款管理** - 借贷关系追踪和提醒
9. **储蓄目标** - 存钱目标和进度追踪
10. **账户转账** - 账户间转账记录

#### 分析模块
11. **高级统计** - 同比、环比、趋势预测
12. **多维分析** - 按时间/分类/标签/账户交叉分析
13. **自定义报表** - 月度/年度财务报告
14. **BI 仪表盘** - 可拖拽的仪表盘布局

#### 协作模块
15. **多人协作** - 家庭账户共享、权限管理
16. **通知系统** - 预算提醒、账单到期、还款提醒
17. **数据同步** - 跨设备数据同步

#### 智能模块
18. **智能分类** - AI 自动分类建议
19. **异常检测** - 异常支出识别
20. **财务健康度** - 评分和建议

---

## 2. 技术架构

### 2.1 整体架构

```
┌──────────────────────────────────────────────────────────┐
│           Next.js 14 全栈应用 (微服务架构)                │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Web 前端    │  │  移动端      │  │  管理后台    │   │
│  │  (Next.js)   │  │  (PWA)       │  │  (Admin)     │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                  │                  │           │
│         └──────────────────┼──────────────────┘           │
│                            │                              │
│  ┌─────────────────────────▼──────────────────────────┐  │
│  │           API Gateway (Next.js API Routes)          │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │  │
│  │  │ 认证服务 │  │ 业务服务 │  │ 分析服务 │             │  │
│  │  └─────────┘  └─────────┘  └─────────┘             │  │
│  └─────────────────────────┬──────────────────────────┘  │
│                            │                              │
│  ┌─────────────────────────▼──────────────────────────┐  │
│  │                   数据访问层                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │  │
│  │  │PostgreSQL│  │  Redis   │  │   S3     │         │  │
│  │  │  主数据库 │  │  缓存    │  │ 文件存储 │         │  │
│  │  └──────────┘  └──────────┘  └──────────┘         │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### 2.2 技术栈

| 层级 | 技术选择 | 说明 |
|------|---------|------|
| **前端框架** | Next.js 14 | App Router, RSC, Server Actions |
| **UI 组件** | Shadcn/UI | 高质量 React 组件库 |
| **样式** | TailwindCSS | 原子化 CSS |
| **图表** | ECharts 5 + Recharts | BI 可视化 |
| **状态管理** | Zustand + React Query | 服务端状态 + 客户端状态 |
| **表单** | React Hook Form + Zod | 类型安全表单 |
| **数据库** | PostgreSQL 16 | 分区表、全文搜索、JSON |
| **缓存** | Redis | 会话、热点数据缓存 |
| **文件存储** | AWS S3 / MinIO | 附件、图片存储 |
| **认证** | NextAuth.js v5 | 多种登录方式 |
| **邮件** | Resend / SendGrid | 通知邮件 |
| **任务队列** | BullMQ | 定时任务、异步任务 |
| **搜索引擎** | PostgreSQL FTS | 全文搜索 |
| **监控** | Sentry | 错误追踪 |
| **分析** | PostHog | 用户行为分析 |

---

## 3. 数据库设计

### 3.1 核心表结构

#### users（用户表）
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  avatar_url VARCHAR(500),
  phone VARCHAR(20),
  timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
  currency CHAR(3) DEFAULT 'CNY',
  locale VARCHAR(10) DEFAULT 'zh-CN',
  preferences JSONB DEFAULT '{}', -- 用户偏好设置
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
```

#### accounts（账户表 - 增强版）
```sql
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  family_id INTEGER, -- 家庭账户（可选）
  name VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'cash', 'alipay', 'wechat', 'card', 'investment'
  subtype VARCHAR(20), -- 子类型：储蓄卡、信用卡、理财等
  currency CHAR(3) DEFAULT 'CNY',
  initial_balance DECIMAL(12,2) DEFAULT 0,
  current_balance DECIMAL(12,2) GENERATED ALWAYS AS (
    initial_balance + COALESCE((
      SELECT COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0)
      FROM transactions
      WHERE transactions.account_id = accounts.id
    ), 0)
  ) STORED,
  credit_limit DECIMAL(12,2), -- 信用卡额度
  billing_day INTEGER, -- 账单日（信用卡）
  payment_due_day INTEGER, -- 还款日
  is_active BOOLEAN DEFAULT TRUE,
  is_hidden BOOLEAN DEFAULT FALSE, -- 是否隐藏（不显示在总资产中）
  icon VARCHAR(50),
  color VARCHAR(7),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_accounts_family ON accounts(family_id);
CREATE INDEX idx_accounts_type ON accounts(type);
```

#### transactions（交易表 - 增强版）
```sql
CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  account_id INTEGER REFERENCES accounts(id) ON DELETE RESTRICT,
  transfer_account_id INTEGER REFERENCES accounts(id), -- 转账目标账户
  type VARCHAR(20) NOT NULL, -- 'income', 'expense', 'transfer'
  amount DECIMAL(12,2) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  subcategory VARCHAR(50), -- 二级分类
  tags TEXT[], -- 标签数组
  merchant VARCHAR(100), -- 商户名称
  location VARCHAR(100), -- 消费地点
  note TEXT,
  attachment_url VARCHAR(500), -- 附件（小票、发票等）
  receipt_images TEXT[], -- 多张收据图片
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_transaction_id INTEGER REFERENCES recurring_transactions(id),
  is_verified BOOLEAN DEFAULT TRUE, -- 是否已确认（银行导入）
  is_split BOOLEAN DEFAULT FALSE, -- 是否为拆分交易
  parent_transaction_id BIGINT REFERENCES transactions(id), -- 父交易（拆分）
  trans_date DATE NOT NULL,
  trans_time TIME, -- 交易时间
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (trans_date);

-- 按月分区
CREATE TABLE transactions_2024_03 PARTITION OF transactions
  FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');

CREATE TABLE transactions_2024_04 PARTITION OF transactions
  FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');

-- 索引
CREATE INDEX idx_transactions_user_date ON transactions(user_id, trans_date DESC);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_tags ON transactions USING GIN(tags);
CREATE INDEX idx_transactions_merchant ON transactions(merchant);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_fulltext ON transactions USING GIN(
  to_tsvector('chinese', COALESCE(note, '') || ' ' || COALESCE(merchant, ''))
);

-- 触发器：更新 updated_at
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### categories（分类表 - 增强版）
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES categories(id), -- 父分类（支持层级）
  name VARCHAR(50) NOT NULL,
  type VARCHAR(10) NOT NULL, -- 'income', 'expense', 'transfer'
  icon VARCHAR(50),
  color VARCHAR(7),
  monthly_budget DECIMAL(12,2), -- 月度预算
  alert_threshold DECIMAL(3,2), -- 预警阈值（如 0.8 = 80%）
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_categories_user_type_name ON categories(user_id, type, name);
CREATE INDEX idx_categories_parent ON categories(parent_id);
```

#### budgets（预算表）
```sql
CREATE TABLE budgets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id),
  period_type VARCHAR(20) NOT NULL, -- 'monthly', 'yearly', 'custom'
  year INTEGER,
  month INTEGER,
  amount DECIMAL(12,2) NOT NULL,
  alert_threshold DECIMAL(3,2) DEFAULT 0.8,
  repeat BOOLEAN DEFAULT TRUE, -- 是否重复到下期
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, year, month)
);

CREATE INDEX idx_budgets_user ON budgets(user_id);
CREATE INDEX idx_budgets_period ON budgets(year, month);
```

#### recurring_transactions（定期交易表）
```sql
CREATE TABLE recurring_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  account_id INTEGER REFERENCES accounts(id),
  category_id INTEGER REFERENCES categories(id),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'income', 'expense'
  amount DECIMAL(12,2) NOT NULL,
  frequency VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'biweekly', 'monthly', 'yearly'
  interval_value INTEGER DEFAULT 1, -- 频率间隔
  day_of_month INTEGER, -- 每月第几天
  day_of_week INTEGER, -- 每周星期几
  start_date DATE NOT NULL,
  end_date DATE, -- 结束日期（可选）
  last_generated_date DATE, -- 上次生成日期
  next_generate_date DATE, -- 下次生成日期
  is_active BOOLEAN DEFAULT TRUE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recurring_user ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_next ON recurring_transactions(next_generate_date);
```

#### tags（标签表）
```sql
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7),
  icon VARCHAR(50),
  type VARCHAR(20), -- 'project', 'location', 'person', 'custom'
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_tags_user ON tags(user_id);
CREATE INDEX idx_tags_type ON tags(type);
```

#### debts（借还款表）
```sql
CREATE TABLE debts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  contact_name VARCHAR(100) NOT NULL, -- 债权人/债务人
  contact_type VARCHAR(20) NOT NULL, -- 'lend'（借出）, 'borrow'（借入）
  amount DECIMAL(12,2) NOT NULL,
  remaining_amount DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2), -- 利率（百分比）
  start_date DATE NOT NULL,
  due_date DATE, -- 应还日期
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'settled', 'overdue'
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_debts_user ON debts(user_id);
CREATE INDEX idx_debts_status ON debts(status);
CREATE INDEX idx_debts_due_date ON debts(due_date);
```

#### debt_repayments（还款记录表）
```sql
CREATE TABLE debt_repayments (
  id SERIAL PRIMARY KEY,
  debt_id INTEGER REFERENCES debts(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  repayment_date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_debt_repayments_debt ON debt_repayments(debt_id);
```

#### savings_goals（储蓄目标表）
```sql
CREATE TABLE savings_goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  target_date DATE,
  category_id INTEGER REFERENCES categories(id),
  icon VARCHAR(50),
  color VARCHAR(7),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  monthly_contribution DECIMAL(12,2), -- 建议月存金额
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_savings_user ON savings_goals(user_id);
CREATE INDEX idx_savings_status ON savings_goals(status);
```

#### transfers（转账记录表）
```sql
CREATE TABLE transfers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  from_account_id INTEGER REFERENCES accounts(id),
  to_account_id INTEGER REFERENCES accounts(id),
  amount DECIMAL(12,2) NOT NULL,
  fee DECIMAL(12,2) DEFAULT 0,
  exchange_rate DECIMAL(10,6), -- 汇率（多币种）
  trans_date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transfers_user ON transfers(user_id);
CREATE INDEX idx_transfers_from ON transfers(from_account_id);
CREATE INDEX idx_transfers_to ON transfers(to_account_id);
```

#### notifications（通知表）
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'budget_alert', 'bill_due', 'debt_reminder', 'goal_achieved'
  title VARCHAR(200) NOT NULL,
  message TEXT,
  data JSONB, -- 附加数据
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

#### families（家庭/协作组表）
```sql
CREATE TABLE families (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL, -- 邀请码
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_families_code ON families(code);
```

#### family_members（家庭成员表）
```sql
CREATE TABLE family_members (
  id SERIAL PRIMARY KEY,
  family_id INTEGER REFERENCES families(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
  permissions JSONB DEFAULT '{}', -- 细粒度权限
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

CREATE INDEX idx_family_members_family ON family_members(family_id);
CREATE INDEX idx_family_members_user ON family_members(user_id);
```

#### exchange_rates（汇率表）
```sql
CREATE TABLE exchange_rates (
  id SERIAL PRIMARY KEY,
  from_currency CHAR(3) NOT NULL,
  to_currency CHAR(3) NOT NULL,
  rate DECIMAL(10,6) NOT NULL,
  date DATE NOT NULL,
  source VARCHAR(50), -- 数据源
  UNIQUE(from_currency, to_currency, date)
);

CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency, date DESC);
```

#### transaction_templates（交易模板表）
```sql
CREATE TABLE transaction_templates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  default_account_id INTEGER REFERENCES accounts(id),
  default_amount DECIMAL(12,2),
  tags TEXT[],
  note_template TEXT,
  icon VARCHAR(50),
  usage_count INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_user ON transaction_templates(user_id);
```

### 3.2 视图和函数

#### 计算账户实时余额的视图
```sql
CREATE VIEW account_balances AS
SELECT
  a.id,
  a.name,
  a.type,
  a.currency,
  a.initial_balance,
  COALESCE(SUM(
    CASE
      WHEN t.type = 'income' THEN t.amount
      WHEN t.type = 'expense' THEN -t.amount
      WHEN t.type = 'transfer' AND t.account_id = a.id THEN -t.amount
      WHEN t.type = 'transfer' AND t.transfer_account_id = a.id THEN t.amount
      ELSE 0
    END
  ), 0) as transaction_balance,
  a.initial_balance + COALESCE(SUM(
    CASE
      WHEN t.type = 'income' THEN t.amount
      WHEN t.type = 'expense' THEN -t.amount
      WHEN t.type = 'transfer' AND t.account_id = a.id THEN -t.amount
      WHEN t.type = 'transfer' AND t.transfer_account_id = a.id THEN t.amount
      ELSE 0
    END
  ), 0) as current_balance
FROM accounts a
LEFT JOIN transactions t ON t.account_id = a.id OR t.transfer_account_id = a.id
GROUP BY a.id, a.name, a.type, a.currency, a.initial_balance;
```

---

## 4. API 设计（增强版）

### 4.1 认证 API
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/logout` | POST | 用户登出 |
| `/api/auth/me` | GET | 获取当前用户 |
| `/api/auth/profile` | PUT | 更新个人资料 |
| `/api/auth/password` | PUT | 修改密码 |
| `/api/auth/avatar` | POST | 上传头像 |
| `/api/auth/preferences` | PUT | 更新偏好设置 |

### 4.2 交易 API
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/transactions` | GET | 获取交易列表（支持分页、筛选、搜索） |
| `/api/transactions` | POST | 创建交易 |
| `/api/transactions/batch` | POST | 批量创建交易 |
| `/api/transactions/import` | POST | 导入交易（CSV/Excel） |
| `/api/transactions/export` | GET | 导出交易（CSV/Excel/PDF） |
| `/api/transactions/:id` | GET | 获取交易详情 |
| `/api/transactions/:id` | PUT | 更新交易 |
| `/api/transactions/:id` | DELETE | 删除交易 |
| `/api/transactions/:id/verify` | PUT | 标记为已确认 |
| `/api/transactions/:id/split` | POST | 拆分交易 |
| `/api/transactions/search` | GET | 全文搜索交易 |
| `/api/transactions/statements` | GET | 获取月度对账单 |

### 4.3 账户 API
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/accounts` | GET | 获取账户列表 |
| `/api/accounts` | POST | 创建账户 |
| `/api/accounts/:id` | PUT | 更新账户 |
| `/api/accounts/:id` | DELETE | 删除账户 |
| `/api/accounts/:id/balance` | GET | 获取账户余额 |
| `/api/accounts/:id/transactions` | GET | 获取账户交易记录 |
| `/api/accounts/transfer` | POST | 账户间转账 |
| `/api/accounts/summary` | GET | 账户汇总（净资产） |
| `/api/accounts/reorder` | PUT | 调整账户排序 |

### 4.4 分类 API
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/categories` | GET | 获取分类列表（树形结构） |
| `/api/categories` | POST | 创建分类 |
| `/api/categories/:id` | PUT | 更新分类 |
| `/api/categories/:id` | DELETE | 删除分类 |
| `/api/categories/tree` | GET | 获取分类树 |
| `/api/categories/budget` | PUT | 设置分类预算 |

### 4.5 预算 API
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/budgets` | GET | 获取预算列表 |
| `/api/budgets` | POST | 创建预算 |
| `/api/budgets/:id` | PUT | 更新预算 |
| `/api/budgets/:id` | DELETE | 删除预算 |
| `/api/budgets/overview` | GET | 预算总览 |
| `/api/budgets/status` | GET | 预算使用状态 |
| `/api/budgets/copy` | POST | 复制预算到下月 |

### 4.6 定期交易 API
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/recurring` | GET | 获取定期交易列表 |
| `/api/recurring` | POST | 创建定期交易 |
| `/api/recurring/:id` | PUT | 更新定期交易 |
| `/api/recurring/:id` | DELETE | 删除定期交易 |
| `/api/recurring/:id/pause` | PUT | 暂停定期交易 |
| `/api/recurring/:id/resume` | PUT | 恢复定期交易 |
| `/api/recurring/generate` | POST | 手动生成本期交易 |
| `/api/recurring/preview` | GET | 预览下次生成时间 |

### 4.7 标签 API
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/tags` | GET | 获取标签列表 |
| `/api/tags` | POST | 创建标签 |
| `/api/tags/:id` | PUT | 更新标签 |
| `/api/tags/:id` | DELETE | 删除标签 |
| `/api/tags/merge` | POST | 合并标签 |

### 4.8 借还款 API
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/debts` | GET | 获取借还款列表 |
| `/api/debts` | POST | 创建借还款记录 |
| `/api/debts/:id` | PUT | 更新借还款 |
| `/api/debts/:id` | DELETE | 删除借还款 |
| `/api/debts/:id/repay` | POST | 还款 |
| `/api/debts/summary` | GET | 借还款汇总 |

### 4.9 储蓄目标 API
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/savings` | GET | 获取储蓄目标列表 |
| `/api/savings` | POST | 创建储蓄目标 |
| `/api/savings/:id` | PUT | 更新储蓄目标 |
| `/api/savings/:id` | DELETE | 删除储蓄目标 |
| `/api/savings/:id/contribute` | POST | 存入资金 |
| `/api/savings/:id/withdraw` | POST | 取出资金 |
| `/api/savings/progress` | GET | 目标完成进度 |

### 4.10 统计分析 API
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/statistics/overview` | GET | 总览数据 |
| `/api/statistics/trend` | GET | 收支趋势 |
| `/api/statistics/category` | GET | 分类统计 |
| `/api/statistics/account` | GET | 账户统计 |
| `/api/statistics/comparison` | GET | 同比环比 |
| `/api/statistics/forecast` | GET | 趋势预测 |
| `/api/statistics/report` | GET | 生成报表（月度/年度） |
| `/api/statistics/health-score` | GET | 财务健康度评分 |
| `/api/statistics/anomalies` | GET | 异常支出检测 |

### 4.11 通知 API
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/notifications` | GET | 获取通知列表 |
| `/api/notifications/:id/read` | PUT | 标记为已读 |
| `/api/notifications/read-all` | PUT | 全部标记为已读 |
| `/api/notifications/settings` | GET | 获取通知设置 |
| `/api/notifications/settings` | PUT | 更新通知设置 |

### 4.12 协作 API
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/families` | GET | 获取家庭列表 |
| `/api/families` | POST | 创建家庭组 |
| `/api/families/:id` | PUT | 更新家庭组 |
| `/api/families/:id` | DELETE | 删除家庭组 |
| `/api/families/:id/members` | GET | 获取成员列表 |
| `/api/families/:id/invite` | POST | 邀请成员 |
| `/api/families/:id/remove` | DELETE | 移除成员 |
| `/api/families/join` | POST | 加入家庭组（通过邀请码） |
| `/api/families/:id/permissions` | PUT | 更新成员权限 |

### 4.13 模板 API
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/templates` | GET | 获取交易模板 |
| `/api/templates` | POST | 创建交易模板 |
| `/api/templates/:id` | PUT | 更新交易模板 |
| `/api/templates/:id` | DELETE | 删除交易模板 |
| `/api/templates/:id/apply` | POST | 应用模板创建交易 |

---

## 5. 前端架构设计

### 5.1 页面结构（完整版）

```
app/
├── (auth)/                    # 认证页面组
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── forgot-password/
│       └── page.tsx
├── dashboard/                 # 主应用（需认证）
│   ├── layout.tsx            # Dashboard 布局
│   ├── page.tsx              # 仪表盘首页
│   ├── transactions/         # 交易管理
│   │   ├── page.tsx         # 交易列表
│   │   ├── new/
│   │   │   └── page.tsx     # 新建交易
│   │   ├── [id]/
│   │   │   └── page.tsx     # 交易详情/编辑
│   │   ├── import/
│   │   │   └── page.tsx     # 导入交易
│   │   └── templates/
│   │       └── page.tsx     # 交易模板
│   ├── accounts/             # 账户管理
│   │   ├── page.tsx
│   │   ├── new/
│   │   │   └── page.tsx
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── transfer/
│   │       └── page.tsx     # 转账
│   ├── categories/           # 分类管理
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── budgets/              # 预算管理
│   │   ├── page.tsx         # 预算列表
│   │   ├── [id]/
│   │   │   └── page.tsx     # 预算详情
│   │   └── setup/
│   │       └── page.tsx     # 预算设置向导
│   ├── recurring/            # 定期交易
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── tags/                 # 标签管理
│   │   └── page.tsx
│   ├── debts/                # 借还款
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── repay/
│   │       └── page.tsx
│   ├── savings/              # 储蓄目标
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── contribute/
│   │       └── page.tsx
│   ├── statistics/           # 数据统计
│   │   ├── page.tsx         # 统计概览
│   │   ├── trends/
│   │   │   └── page.tsx     # 趋势分析
│   │   ├── comparison/
│   │   │   └── page.tsx     # 对比分析
│   │   ├── reports/
│   │   │   └── page.tsx     # 报表中心
│   │   └── health/
│   │       └── page.tsx     # 财务健康
│   ├── settings/             # 设置
│   │   ├── page.tsx         # 设置首页
│   │   ├── profile/
│   │   │   └── page.tsx     # 个人资料
│   │   ├── preferences/
│   │   │   └── page.tsx     # 偏好设置
│   │   ├── accounts/
│   │   │   └── page.tsx     # 账户设置
│   │   ├── notifications/
│   │   │   └── page.tsx     # 通知设置
│   │   ├── data/
│   │   │   └── page.tsx     # 数据管理
│   │   └── family/
│   │       └── page.tsx     # 家庭协作
│   └── shared/              # 共享数据
│       └── [familyId]/
│           └── page.tsx
├── api/                      # API Routes
│   ├── auth/
│   ├── transactions/
│   ├── accounts/
│   ├── categories/
│   ├── budgets/
│   ├── recurring/
│   ├── tags/
│   ├── debts/
│   ├── savings/
│   ├── statistics/
│   ├── notifications/
│   ├── families/
│   └── templates/
├── layout.tsx                # 根布局
└── page.tsx                  # 首页
```

### 5.2 组件架构

```
components/
├── ui/                       # Shadcn/UI 基础组件
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── select.tsx
│   ├── table.tsx
│   └── ...
├── layout/                   # 布局组件
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
│   └── MobileNav.tsx
├── dashboard/                # 仪表盘组件
│   ├── StatCard.tsx
│   ├── QuickActions.tsx
│   ├── RecentTransactions.tsx
│   └── BudgetProgress.tsx
├── transactions/             # 交易组件
│   ├── TransactionList.tsx
│   ├── TransactionCard.tsx
│   ├── TransactionForm.tsx
│   ├── TransactionFilters.tsx
│   ├── TransactionSearch.tsx
│   ├── SplitTransaction.tsx
│   └── ImportWizard.tsx
├── accounts/                 # 账户组件
│   ├── AccountCard.tsx
│   ├── AccountList.tsx
│   ├── AccountForm.tsx
│   ├── TransferForm.tsx
│   └── BalanceDisplay.tsx
├── budgets/                  # 预算组件
│   ├── BudgetCard.tsx
│   ├── BudgetProgress.tsx
│   ├── BudgetAlert.tsx
│   └── BudgetSetupWizard.tsx
├── statistics/               # 统计组件
│   ├── TrendChart.tsx
│   ├── CategoryPieChart.tsx
│   ├── CategoryBarChart.tsx
│   ├── HeatmapChart.tsx
│   ├── ComparisonChart.tsx
│   ├── ForecastChart.tsx
│   ├── HealthScore.tsx
│   └── ReportGenerator.tsx
├── debts/                    # 借还款组件
│   ├── DebtCard.tsx
│   ├── DebtList.tsx
│   ├── RepaymentForm.tsx
│   └── DebtTimeline.tsx
├── savings/                  # 储蓄目标组件
│   ├── GoalCard.tsx
│   ├── GoalProgress.tsx
│   ├── ContributionForm.tsx
│   └── GoalTimeline.tsx
├── notifications/            # 通知组件
│   ├── NotificationCenter.tsx
│   ├── NotificationItem.tsx
│   └── NotificationSettings.tsx
└── shared/                   # 共享组件
    ├── DatePicker.tsx
    ├── AmountInput.tsx
    ├── CategorySelect.tsx
    ├── TagSelect.tsx
    ├── AccountSelect.tsx
    ├── CurrencyInput.tsx
    └── FileUpload.tsx
```

### 5.3 UI 设计规范

#### 颜色系统
```css
/* 品牌色 */
--primary: {50: #eff6ff, 500: #3b82f6, 600: #2563eb, 700: #1d4ed8}
--success: {50: #f0fdf4, 500: #10b981, 600: #059669}
--warning: {50: #fffbeb, 500: #f59e0b, 600: #d97706}
--danger: {50: #fef2f2, 500: #ef4444, 600: #dc2626}

/* 语义色 */
--income: #10b981
--expense: #ef4444
--transfer: #3b82f6

/* 分类颜色 */
--category-food: #f97316
--category-transport: #3b82f6
--category-shopping: #a855f7
--category-entertainment: #ec4899
--category-housing: #ef4444
--category-medical: #14b8a6
--category-education: #8b5cf6
--category-other: #6b7280
```

#### 组件示例
```tsx
// 统计卡片（增强版）
<StatCard
  title="总收入"
  value="¥8,500"
  change="+12%"
  trend="up"
  icon="📈"
  secondary="vs 上月"
  chart={miniSparkline}
/>

// 预算卡片（带进度条）
<BudgetCard
  category="餐饮"
  budget="¥2000"
  spent="¥1650"
  percentage={82.5}
  alert={percentage > 80}
  remaining="¥350"
  daysLeft={12}
/>

// 储蓄目标卡片
<GoalCard
  name="买房基金"
  target="¥500,000"
  current="¥125,000"
  percentage={25}
  targetDate="2026-12-31"
  monthlyContribution="¥5000"
  status="on-track"
/>
```

---

## 6. 高级功能设计

### 6.1 预算管理
- **分类预算** - 为每个分类设置月度预算
- **总预算** - 设置总支出上限
- **预算预警** - 达到阈值时发送通知
- **预算结转** - 未用预算结转到下月
- **预算复制** - 一键复制预算到下月

### 6.2 定期交易
- **自动记录** - 按频率自动生成交易
- **智能提醒** - 生成前发送提醒
- **手动跳过** - 暂停某次生成
- **结束条件** - 设置结束日期或次数
- **预览功能** - 查看未来生成计划

### 6.3 借还款管理
- **借入/借出** - 记录借贷关系
- **分期还款** - 记录多笔还款
- **利息计算** - 自动计算利息
- **到期提醒** - 还款日提醒
- **对账单** - 生成借还款对账单

### 6.4 储蓄目标
- **目标设置** - 设置目标金额和日期
- **进度追踪** - 实时显示完成进度
- **智能建议** - 计算建议月存金额
- **达成奖励** - 目标达成庆祝动画
- **目标对比** - 多个目标进度对比

### 6.5 多币种支持
- **多账户币种** - 每个账户独立币种
- **实时汇率** - 自动获取最新汇率
- **汇率转换** - 交易时自动转换
- **汇率历史** - 保存历史汇率
- **汇总换算** - 总资产按基准币种汇总

### 6.6 数据导入导出
- **CSV 导入** - 支持银行 CSV 导入
- **Excel 导入** - 支持 Excel 格式
- **智能匹配** - 自动匹配分类和账户
- **导出报表** - 导出为 CSV/Excel/PDF
- **数据备份** - 完整数据备份/恢复

### 6.7 高级搜索
- **全文搜索** - PostgreSQL FTS
- **多条件筛选** - 日期、分类、账户、标签
- **保存搜索** - 保存常用搜索条件
- **快速筛选** - 预设筛选条件
- **搜索历史** - 最近搜索记录

### 6.8 通知系统
- **预算预警** - 超过阈值通知
- **账单提醒** - 定期账单提醒
- **还款提醒** - 借还款到期提醒
- **目标提醒** - 储蓄目标进度提醒
- **邮件通知** - 邮件推送通知

### 6.9 协作功能
- **家庭账户** - 多人共享账户
- **权限管理** - 4 级权限（所有者、管理、成员、查看）
- **邀请码** - 邀请成员加入
- **数据隔离** - 个人数据独立
- **协作记账** - 多人共同记账

### 6.10 智能分析
- **同比环比** - 与上月、去年同期对比
- **趋势预测** - 基于历史数据预测
- **异常检测** - 识别异常支出
- **智能分类** - AI 自动分类建议
- **健康评分** - 财务健康度评分

---

## 7. 性能优化策略

### 7.1 数据库优化
- **分区表** - 按月分区交易表
- **复合索引** - (user_id, date, category)
- **GIN 索引** - 标签和全文搜索
- **物化视图** - 预计算统计数据
- **连接池** - PgBouncer 连接池

### 7.2 缓存策略
```typescript
// Redis 缓存层次
L1: 浏览器缓存 (React Query) - 5分钟
L2: Redis 服务端缓存 - 30分钟
L3: PostgreSQL 查询缓存

// 缓存键设计
user:{userId}:transactions:{date}
user:{userId}:statistics:{period}
user:{userId}:budgets:{month}
```

### 7.3 前端优化
- **Server Components** - 减少客户端 JS
- **动态导入** - 按需加载图表组件
- **虚拟滚动** - 长列表优化
- **图片优化** - next/image 自动优化
- **路由预加载** - 预加载常用页面
- **SWR/React Query** - 智能数据缓存

### 7.4 构建优化
- **Tree Shaking** - 移除未使用代码
- **代码分割** - 路由级别分割
- **CSS 优化** - TailwindCSS 自动清除
- **压缩** - Gzip/Brotli 压缩

---

## 8. 安全设计

### 8.1 认证安全
- **密码加密** - bcrypt (salt rounds: 12)
- **JWT** - RS256 非对称加密
- **Session** - httpOnly + Secure + SameSite
- **2FA** - 可选双因素认证
- **密码重置** - 安全的令牌机制

### 8.2 API 安全
- **Rate Limiting** - API 限流
- **CORS** - 严格的跨域策略
- **Helmet** - 安全头配置
- **输入验证** - Zod schema 验证
- **SQL 注入防护** - 参数化查询
- **XSS 防护** - React 自动转义

### 8.3 数据安全
- **行级安全** - PostgreSQL RLS
- **加密存储** - 敏感数据加密
- **审计日志** - 关键操作日志
- **数据备份** - 每日自动备份
- **权限分离** - 最小权限原则

---

## 9. 部署架构

### 9.1 生产环境架构

```
┌─────────────────────────────────────────────────┐
│              CDN (Cloudflare)                   │
│         静态资源 + DDoS 防护                     │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         Load Balancer (Nginx)                   │
└──────────────────┬──────────────────────────────┘
                   │
      ┌────────────┼────────────┐
      │            │            │
┌─────▼─────┐ ┌───▼────┐ ┌────▼─────┐
│  Next.js  │ │Next.js │ │ Next.js  │
│  Instance │ │Instance│ │ Instance │
│    #1     │ │  #2    │ │   #3     │
└─────┬─────┘ └───┬────┘ └────┬─────┘
      │           │           │
      └───────────┼───────────┘
                  │
      ┌───────────┴───────────┐
      │                       │
┌─────▼──────┐       ┌────────▼────────┐
│ PostgreSQL │       │      Redis      │
│  Primary   │◀─────│    (Cache)      │
└─────┬──────┘       └─────────────────┘
      │ Replication
┌─────▼──────┐
│ PostgreSQL │
│  Standby   │
└────────────┘
```

### 9.2 Docker Compose 配置

```yaml
version: '3.8'

services:
  app:
    image: accounting-app:latest
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/app
      - REDIS_URL=redis://redis:6379
    ports:
      - "3000:3000"
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=app
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## 10. 开发计划（增强版）

### 阶段 1：基础框架（2-3 天）
- [ ] 初始化 Next.js 项目 + Shadcn/UI
- [ ] 配置 TailwindCSS + ECharts
- [ ] 设置数据库（PostgreSQL + Redis）
- [ ] 实现用户认证（NextAuth.js）
- [ ] 基础布局和导航

### 阶段 2：核心功能（3-4 天）
- [ ] 账户管理（CRUD + 余额计算）
- [ ] 分类管理（树形结构）
- [ ] 交易管理（CRUD + 分页 + 搜索）
- [ ] 交易表单（快速录入 + 模板）
- [ ] Dashboard 页面

### 阶段 3：高级功能（4-5 天）
- [ ] 预算管理（设置 + 追踪 + 预警）
- [ ] 定期交易（自动生成 + 提醒）
- [ ] 标签系统（多维度标签）
- [ ] 账户转账（单币种 + 多币种）
- [ ] 借还款管理

### 阶段 4：数据统计（3-4 天）
- [ ] 基础统计（收入、支出、余额）
- [ ] ECharts 图表集成（5+ 种图表）
- [ ] 同比环比分析
- [ ] 趋势预测（简单线性回归）
- [ ] 报表生成（PDF/Excel）

### 阶段 5：协作与通知（2-3 天）
- [ ] 家庭账户（邀请 + 权限）
- [ ] 通知系统（站内信 + 邮件）
- [ ] 储蓄目标（进度追踪）
- [ ] 数据导入导出（CSV/Excel）

### 阶段 6：优化与测试（2-3 天）
- [ ] 性能优化（缓存 + 分区表）
- [ ] 安全加固（认证 + 权限）
- [ ] 单元测试（Jest + Testing Library）
- [ ] E2E 测试（Playwright）
- [ ] 响应式适配

---

## 11. 成功标准

### 功能完整性
- ✅ 所有核心功能可用
- ✅ 至少 80% 高级功能实现
- ✅ 无 P0/P1 级别 Bug

### 性能指标
- ✅ 首页加载 < 2s
- ✅ API 响应 < 200ms (P95)
- ✅ 图表渲染 < 500ms
- ✅ 支持 1000+ 用户并发

### 代码质量
- ✅ TypeScript 覆盖率 > 95%
- ✅ 测试覆盖率 > 70%
- ✅ ESLint 零错误
- ✅ 通过所有 CI 检查

---

**设计文档版本：** 2.0 (增强版)
**复杂度：** 高级（企业级）
**预计开发时间：** 16-22 天
