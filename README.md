# My Accounting App

一个现代化的个人记账应用，使用 Next.js 14 构建，支持账户管理、交易记录和数据可视化。

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI 组件**: Shadcn/UI + TailwindCSS
- **认证**: NextAuth.js v5
- **数据库**: PostgreSQL 16
- **语言**: TypeScript
- **样式**: TailwindCSS

## 功能特性

- ✅ 用户注册和登录
- ✅ 账户管理（创建、查看账户余额）
- ✅ 交易记录（创建、查看、删除交易）
- ✅ 分类管理（创建收入/支出分类）
- ✅ 财务概览仪表盘
- ✅ 数据统计（ECharts 收支趋势图）
- ✅ 设置页面

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=accounting
DB_USER=postgres
DB_PASSWORD=your_password

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_here
```

### 3. 初始化数据库

```bash
psql -U postgres -d accounting -f database/migrations/001_initial.sql
```

或使用 Docker 启动 PostgreSQL：

```bash
docker run --name accounting-db \
  -e POSTGRES_DB=accounting \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:16
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
my-accounting-app/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 认证相关页面
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/           # 仪表盘页面
│   │   ├── layout.tsx       # Dashboard 布局
│   │   ├── page.tsx         # Dashboard 主页
│   │   ├── transactions/    # 交易页面
│   │   └── accounts/        # 账户页面
│   └── api/                 # API 路由
│       ├── auth/            # NextAuth 配置
│       ├── accounts/        # 账户 API
│       ├── categories/      # 分类 API
│       └── transactions/    # 交易 API
├── components/              # React 组件
│   └── ui/                  # Shadcn/UI 组件
├── lib/                     # 工具库
│   ├── auth.ts             # NextAuth 配置
│   └── db.ts               # 数据库连接
├── database/               # 数据库迁移
│   └── migrations/
└── public/                 # 静态资源
```

## API 端点

### 认证

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth 处理器 |
| `/api/auth/register` | POST | 用户注册 |

### 账户

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/accounts` | GET | 获取账户列表（含余额） |
| `/api/accounts` | POST | 创建新账户 |

### 交易

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/transactions` | GET | 获取交易列表 |
| `/api/transactions` | POST | 创建新交易 |
| `/api/transactions/[id]` | PUT | 更新交易 |
| `/api/transactions/[id]` | DELETE | 删除交易 |

### 分类

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/categories` | GET | 获取分类列表 |
| `/api/categories` | POST | 创建新分类 |

## 数据库架构

### 核心表

- **users**: 用户信息
- **accounts**: 账户（支持多币种）
- **categories**: 收支分类
- **transactions**: 交易记录（按月分区）

详细结构请查看 `database/migrations/001_initial.sql`

## 开发命令

```bash
# 开发服务器
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

## 部署

### 使用 Docker

```bash
# 构建镜像
docker build -t accounting-app .

# 运行容器
docker run -p 3000:3000 --env-file .env accounting-app
```

### 使用 Vercel

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署完成

## 待开发功能

- [ ] ECharts 数据可视化
- [ ] 预算管理
- [ ] 定期交易
- [ ] 债务追踪
- [ ] 存款目标
- [ ] 多币种支持
- [ ] 数据导入/导出
- [ ] 单元测试

## 贡献

欢迎提交 Issue 和 Pull Request！

## License

MIT
