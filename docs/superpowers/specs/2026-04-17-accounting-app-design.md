# 记账应用 - 完整设计文档

**项目类型：** Next.js 全栈 Web 应用
**设计日期：** 2026-04-17
**技术栈：** Next.js 14 + PostgreSQL + ECharts + TailwindCSS

---

## 1. 项目概述

### 1.1 目标
构建一个功能完整的个人记账应用，支持交易记录、账户管理、数据可视化统计和用户认证。

### 1.2 核心功能
1. **用户认证** - 注册、登录、会话管理
2. **交易管理** - 创建、查看、编辑、删除交易记录
3. **账户管理** - 管理多个支付账户（现金、支付宝、银行卡等）
4. **数据统计** - BI 风格的数据可视化和报表
5. **数据隔离** - 多用户数据完全隔离

---

## 2. 技术架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────┐
│          Next.js 14 全栈应用                     │
│          (App Router + API Routes)              │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────┐        ┌──────────────┐        │
│  │  前端页面    │        │  API Routes  │        │
│  │  React SSR  │──────▶│  (/api/*)    │        │
│  │             │        │              │        │
│  │  • 首页     │        │  • 认证      │        │
│  │  • 仪表盘   │        │  • 交易 CRUD │        │
│  │  • 统计     │        │  • 账户管理  │        │
│  │  • 登录     │        │  • 统计数据  │        │
│  └─────────────┘        └──────┬───────┘        │
│                                 │                │
│                          ┌──────▼───────┐        │
│                          │  PostgreSQL  │        │
│                          │  分区表优化   │        │
│                          └──────────────┘        │
└─────────────────────────────────────────────────┘
```

### 2.2 技术栈

| 层级 | 技术选择 | 说明 |
|------|---------|------|
| **前端框架** | Next.js 14 | App Router, React Server Components |
| **样式** | TailwindCSS | 现代简洁风格 |
| **图表** | ECharts 5 | BI 风格数据可视化 |
| **数据库** | PostgreSQL 16 | 分区表、窗口函数 |
| **认证** | NextAuth.js | JWT + Session |
| **状态管理** | React Hooks | Server Components 减少客户端状态 |
| **表单** | React Hook Form | 性能优化 |
| **数据验证** | Zod | TypeScript 优先 |

---

## 3. 数据库设计

### 3.1 表结构

#### users（用户表）
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

#### accounts（账户表）
```sql
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  currency CHAR(3) DEFAULT 'CNY',
  type VARCHAR(20) NOT NULL, -- 'cash', 'alipay', 'wechat', 'card'
  initial_balance DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_accounts_user ON accounts(user_id);
```

#### transactions（交易表）
```sql
CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  account_id INTEGER REFERENCES accounts(id) ON DELETE RESTRICT,
  amount DECIMAL(12,2) NOT NULL,
  category VARCHAR(50),
  note TEXT,
  trans_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (trans_date);

-- 按月分区
CREATE TABLE transactions_2024_03 PARTITION OF transactions
  FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');

CREATE TABLE transactions_2024_04 PARTITION OF transactions
  FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');

-- 索引
CREATE INDEX idx_transactions_user_date ON transactions(user_id, trans_date DESC);
CREATE INDEX idx_transactions_account ON transactions(account_id);
```

#### categories（分类表）
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(10) NOT NULL, -- 'income', 'expense'
  icon VARCHAR(50),
  color VARCHAR(7),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_categories_user_type_name ON categories(user_id, type, name);
```

### 3.2 初始数据

```sql
-- 默认分类（收入）
INSERT INTO categories (user_id, name, type, icon, color) VALUES
  (1, '工资', 'income', '💰', '#10B981'),
  (1, '奖金', 'income', '🎁', '#3B82F6'),
  (1, '理财', 'income', '📈', '#8B5CF6');

-- 默认分类（支出）
INSERT INTO categories (user_id, name, type, icon, color) VALUES
  (1, '餐饮', 'expense', '🍜', '#F97316'),
  (1, '购物', 'expense', '🛒', '#A855F7'),
  (1, '交通', 'expense', '🚗', '#3B82F6'),
  (1, '娱乐', 'expense', '🎮', '#EC4899'),
  (1, '居住', 'expense', '🏠', '#EF4444'),
  (1, '医疗', 'expense', '💊', '#14B8A6');
```

---

## 4. API 设计

### 4.1 认证 API

| 端点 | 方法 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| `/api/auth/register` | POST | 用户注册 | `{email, password, name}` | `{user, token}` |
| `/api/auth/login` | POST | 用户登录 | `{email, password}` | `{user, token}` |
| `/api/auth/logout` | POST | 用户登出 | - | `{success}` |
| `/api/auth/me` | GET | 获取当前用户 | - | `{user}` |

### 4.2 交易 API

| 端点 | 方法 | 说明 | 参数 |
|------|------|------|------|
| `/api/transactions` | GET | 获取交易列表 | `?page=1&limit=20&startDate=&endDate=&category=` |
| `/api/transactions` | POST | 创建交易 | `{accountId, amount, category, note, transDate}` |
| `/api/transactions/:id` | GET | 获取交易详情 | - |
| `/api/transactions/:id` | PUT | 更新交易 | `{accountId, amount, category, note, transDate}` |
| `/api/transactions/:id` | DELETE | 删除交易 | - |

### 4.3 账户 API

| 端点 | 方法 | 说明 | 参数 |
|------|------|------|------|
| `/api/accounts` | GET | 获取账户列表 | - |
| `/api/accounts` | POST | 创建账户 | `{name, type, initialBalance}` |
| `/api/accounts/:id` | PUT | 更新账户 | `{name, type}` |
| `/api/accounts/:id` | DELETE | 删除账户 | - |
| `/api/accounts/:id/balance` | GET | 获取账户余额 | - |

### 4.4 统计 API

| 端点 | 方法 | 说明 | 响应 |
|------|------|------|------|
| `/api/statistics/overview` | GET | 总览数据 | `{totalIncome, totalExpense, balance, transactionCount}` |
| `/api/statistics/trend` | GET | 收支趋势 | `{dates[], income[], expense[]}` |
| `/api/statistics/category` | GET | 分类统计 | `[{category, amount, count, percentage}]` |
| `/api/statistics/account` | GET | 账户分布 | `[{account, balance, percentage}]` |

---

## 5. 前端设计

### 5.1 页面结构

```
app/
├── (auth)/                 # 认证相关页面组
│   ├── login/
│   │   └── page.tsx       # 登录页面
│   └── register/
│       └── page.tsx       # 注册页面
├── dashboard/              # 主应用页面组（需认证）
│   ├── page.tsx           # 仪表盘首页
│   ├── transactions/      # 交易管理
│   │   ├── page.tsx       # 交易列表
│   │   ├── new/
│   │   │   └── page.tsx   # 新建交易
│   │   └── [id]/
│   │       └── page.tsx   # 交易详情/编辑
│   ├── accounts/          # 账户管理
│   │   ├── page.tsx       # 账户列表
│   │   └── new/
│   │       └── page.tsx   # 新建账户
│   └── statistics/        # 数据统计
│       └── page.tsx       # BI 风格统计页面
├── api/                   # API Routes
│   ├── auth/
│   ├── transactions/
│   ├── accounts/
│   └── statistics/
├── layout.tsx             # 根布局
└── page.tsx               # 首页（重定向到 dashboard）
```

### 5.2 组件设计

#### 基础 UI 组件（`components/ui/`）
- `Button.tsx` - 按钮
- `Input.tsx` - 输入框
- `Card.tsx` - 卡片容器
- `Modal.tsx` - 模态框
- `Table.tsx` - 表格
- `Badge.tsx` - 标签

#### 业务组件
- `TransactionCard.tsx` - 交易卡片
- `TransactionForm.tsx` - 交易表单
- `AccountCard.tsx` - 账户卡片
- `StatCard.tsx` - 统计卡片
- `TrendChart.tsx` - 趋势图（ECharts）
- `CategoryChart.tsx` - 分类饼图
- `CategoryBarChart.tsx` - 分类柱状图
- `HeatmapChart.tsx` - 热力图

### 5.3 布局设计

#### Dashboard 布局
```
┌─────────────────────────────────────────┐
│  顶部导航栏                                │
│  Logo | 首页 交易 账户 统计  用户头像      │
├─────────────────────────────────────────┤
│                                          │
│  核心指标卡片（4个）                       │
│  [总收入] [总支出] [净收入] [交易笔数]      │
│                                          │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │  收支趋势图   │  │  支出构成饼图     │ │
│  │  (ECharts)   │  │  (ECharts)       │ │
│  └──────────────┘  └──────────────────┘ │
│                                          │
│  最近交易列表                              │
│  ┌─────────────────────────────────────┐ │
│  │ 🍜 午餐 - 麦当劳      -¥35.00        │ │
│  │ 💰 3月工资            +¥8500.00      │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### 统计页面布局（BI 风格）
```
┌─────────────────────────────────────────┐
│  时间筛选: [本月] [本季] [本年] [自定义]   │
├─────────────────────────────────────────┤
│  核心指标卡片（4个）                       │
├─────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────────┐ │
│  │  收支趋势     │  │  支出构成         │ │
│  └──────────────┘  └──────────────────┘ │
├─────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │分类排行  │ │账户分布  │ │每日热力  │ │
│  └──────────┘ └──────────┘ └──────────┘ │
├─────────────────────────────────────────┤
│  分类明细表格                              │
│  | 分类 | 金额 | 占比 | 笔数 | 平均 | 趋势 | │
└─────────────────────────────────────────┘
```

### 5.4 UI 设计规范

#### 颜色方案
```css
/* 主色调 */
--primary: #3B82F6;       /* 蓝色 - 主要操作 */
--success: #10B981;       /* 绿色 - 收入/成功 */
--danger: #EF4444;        /* 红色 - 支出/删除 */
--warning: #F59E0B;       /* 橙色 - 警告 */

/* 中性色 */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-900: #111827;

/* 分类颜色 */
--category-food: #F97316;   /* 餐饮 - 橙色 */
--category-shopping: #A855F7; /* 购物 - 紫色 */
--category-transport: #3B82F6; /* 交通 - 蓝色 */
--category-entertainment: #EC4899; /* 娱乐 - 粉色 */
```

#### 组件示例
```tsx
// 统计卡片
<StatCard
  title="总收入"
  value="¥8,500"
  change="+12%"
  trend="up"
  icon="📈"
/>

// 交易卡片
<TransactionCard
  category="餐饮"
  title="午餐 - 麦当劳"
  amount={-35}
  date="今天 12:30"
  account="支付宝"
/>
```

---

## 6. ECharts 图表设计

### 6.1 收支趋势图
- **类型：** 折线 + 柱状组合图
- **数据：** 6-12 个月的收入/支出/净收入
- **交互：** 缩放、tooltip、数据点点击

### 6.2 支出构成饼图
- **类型：** 环形饼图
- **数据：** 各分类支出金额及占比
- **交互：** 扇区高亮、标签显示

### 6.3 分类柱状图
- **类型：** 横向柱状图
- **数据：** 分类支出排行（Top 10）
- **交互：** 柱状渐变色、数值标签

### 6.4 账户余额分布
- **类型：** 饼图
- **数据：** 各账户余额占比

### 6.5 每日支出热力图
- **类型：** 日历热力图
- **数据：** 每日支出金额（按周/月）
- **交互：** 颜色深浅表示金额大小

---

## 7. 认证与安全

### 7.1 认证流程
1. 用户注册/登录 → 生成 JWT
2. JWT 存储在 httpOnly Cookie
3. 每次请求自动携带 Cookie
4. 服务端验证 JWT 并提取 user_id
5. 所有数据查询自动添加 user_id 过滤

### 7.2 安全措施
- 密码使用 bcrypt 加密（salt rounds: 10）
- JWT 使用 RS256 签名
- SQL 注入防护（参数化查询）
- XSS 防护（React 自动转义）
- CSRF 防护（SameSite Cookie）
- Rate Limiting（API 限流）

---

## 8. 性能优化

### 8.1 数据库优化
- 交易表按月分区，提升查询性能
- 复合索引：(user_id, trans_date)
- 使用窗口函数计算运行余额
- 查询限制返回数量（分页）

### 8.2 前端优化
- Next.js Server Components 减少客户端 JS
- 图片优化（next/image）
- 路由预加载
- React Query 数据缓存
- 虚拟滚动（长列表）

### 8.3 Docker 优化
- 多阶段构建减少镜像大小
- 使用 Alpine 基础镜像
- 依赖缓存加速构建

---

## 9. 部署方案

### 9.1 开发环境
```bash
npm run dev          # Next.js 开发服务器
docker-compose up    # PostgreSQL 数据库
```

### 9.2 生产环境
```bash
# 构建镜像
docker build -t accounting-app .

# 运行容器
docker-compose -f docker-compose.prod.yml up -d
```

### 9.3 CI/CD 流程
```
代码推送 → GitHub Actions → 构建 Next.js 应用
  → 构建 Docker 镜像 → 推送到 GHCR
  → 服务器拉取镜像 → 重启容器
```

---

## 10. 开发计划

### 阶段 1：基础框架（1-2 天）
- [ ] 初始化 Next.js 项目
- [ ] 配置 TailwindCSS + ECharts
- [ ] 设置数据库连接
- [ ] 创建基础表结构

### 阶段 2：认证系统（1 天）
- [ ] 实现注册/登录 API
- [ ] JWT 认证中间件
- [ ] 登录/注册页面

### 阶段 3：核心功能（2-3 天）
- [ ] 账户管理 CRUD
- [ ] 交易管理 CRUD
- [ ] Dashboard 页面

### 阶段 4：数据统计（1-2 天）
- [ ] 统计 API 实现
- [ ] ECharts 图表集成
- [ ] BI 风格统计页面

### 阶段 5：完善与优化（1 天）
- [ ] 错误处理
- [ ] Loading 状态
- [ ] 响应式适配
- [ ] 单元测试

---

## 11. 技术要点

### 11.1 Next.js App Router
- Server Components 优先
- Client Components 仅在必要时使用
- 路由组 `(auth)` 和 `(dashboard)`
- 并行路由和拦截路由（可选）

### 11.2 数据获取
```tsx
// Server Component - 直接在组件中查询
async function getTransactions(userId: string) {
  const pool = await getPool();
  const result = await pool.query(
    'SELECT * FROM transactions WHERE user_id = $1 ORDER BY trans_date DESC',
    [userId]
  );
  return result.rows;
}

// Client Component - 使用 SWR 或 React Query
const { data, error, isLoading } = useSWR('/api/transactions', fetcher);
```

### 11.3 ECharts 集成
```tsx
'use client';
import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export function TrendChart({ data }) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chart = echarts.init(chartRef.current!);
    chart.setOption({
      // ECharts 配置
    });
    return () => chart.dispose();
  }, [data]);

  return <div ref={chartRef} style={{ height: '400px' }} />;
}
```

---

## 12. 成功标准

### 功能完整性
- ✅ 用户可以注册和登录
- ✅ 用户可以管理多个账户
- ✅ 用户可以记录、查看、编辑、删除交易
- ✅ 用户可以查看各种统计图表

### 性能指标
- ✅ 页面首次加载 < 2s
- ✅ API 响应时间 < 200ms
- ✅ 图表渲染 < 500ms

### 代码质量
- ✅ TypeScript 类型覆盖率 > 90%
- ✅ 关键功能单元测试覆盖率 > 80%
- ✅ 无 ESLint 错误
- ✅ 通过所有 CI 检查

---

**设计文档版本：** 1.0
**最后更新：** 2026-04-17
