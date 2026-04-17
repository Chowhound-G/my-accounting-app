# My Accounting App

一个简单的记账应用，展示 CI/CD 实践。

## 技术栈

- **后端**: Node.js + Express
- **数据库**: PostgreSQL 16
- **容器化**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/my-accounting-app.git
cd my-accounting-app

# 启动服务
docker-compose up -d

# 访问 API
curl http://localhost:3000/health
```

## 项目结构

```
my-accounting-app/
├── backend/
│   ├── server.js          # Express API 服务器
│   ├── Dockerfile         # API 镜像构建
│   ├── package.json       # 依赖配置
│   └── health-check.js    # 健康检查脚本
├── scripts/
│   └── test-api.sh        # API 测试脚本
├── .github/
│   └── workflows/
│       └── ci.yml         # GitHub Actions CI/CD
├── docker-compose.yml     # 容器编排
├── init.sql              # 数据库初始化
└── DEPLOYMENT.md         # 详细部署指南
```

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/api/transactions` | GET | 获取交易列表 |
| `/api/transactions` | POST | 创建交易 |

## CI/CD

### 工作流程

```
代码推送 → GitHub Actions → 构建 → 测试 → 安全扫描
```

### 查看状态

[GitHub Actions](https://github.com/YOUR_USERNAME/my-accounting-app/actions)

## 本地开发

```bash
# 安装依赖
cd backend && npm install

# 启动开发服务器
npm run dev

# 运行测试
npm test

# 健康检查
npm run health
```

## 部署

详细的部署指南请查看 [DEPLOYMENT.md](DEPLOYMENT.md)

## License

MIT
