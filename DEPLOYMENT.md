# 部署指南

这是一个简单的 CI/CD 部署指南，帮助你从本地开发到生产部署。

---

## 📋 目录

1. [本地开发](#本地开发)
2. [GitHub 设置](#github-设置)
3. [CI/CD 流程](#cicd-流程)
4. [生产部署选项](#生产部署选项)
5. [快速开始](#快速开始)

---

## 🚀 本地开发

### 1. 使用 Docker Compose（推荐）

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 清理数据
docker-compose down -v
```

服务访问:
- API: http://localhost:3000
- PostgreSQL: localhost:5432

### 2. 手动运行（开发模式）

```bash
# 1. 启动数据库
docker run -d \
  --name accounting-db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=mydatabase \
  -p 5432:5432 \
  postgres:16-alpine

# 2. 初始化数据库
psql -h localhost -U admin -d mydatabase -f init.sql

# 3. 安装依赖
cd backend
npm install

# 4. 启动服务
npm start
```

---

## 🔧 GitHub 设置

### 1. 创建 GitHub 仓库

```bash
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/my-accounting-app.git

# 推送代码
git add .
git commit -m "Initial commit: CI/CD setup"
git push -u origin main
```

### 2. 配置 GitHub Secrets（可选）

如果要推送到 Docker Hub:

```
Settings → Secrets and variables → Actions → New repository secret
```

添加以下 secrets:
- `DOCKER_USERNAME` - Docker Hub 用户名
- `DOCKER_PASSWORD` - Docker Hub 访问令牌

---

## 🔄 CI/CD 流程

### 工作流说明

`.github/workflows/ci.yml` 定义了以下任务:

| Job | 说明 |
|-----|------|
| **lint** | 代码质量检查 |
| **build** | Docker 镜像构建 |
| **test** | API 端点测试 |
| **security** | 安全漏洞扫描 |

### 触发条件

- Push 到 `main` 或 `develop` 分支
- 创建 Pull Request 到 `main` 分支

### 查看 CI 状态

```
https://github.com/YOUR_USERNAME/my-accounting-app/actions
```

---

## 🌐 生产部署选项

### 选项 1: Docker Compose（最简单）

```bash
# 在服务器上克隆仓库
git clone https://github.com/YOUR_USERNAME/my-accounting-app.git
cd my-accounting-app

# 配置环境变量（可选）
cat > .env << EOF
DB_USER=admin
DB_PASSWORD=strong_password_here
DB_NAME=mydatabase
EOF

# 启动服务
docker-compose up -d

# 配置反向代理（Nginx 示例见下）
```

### 选项 2: Docker Hub + Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api:
    image: YOUR_USERNAME/accounting-api:latest
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}

volumes:
  postgres_data:
```

### 选项 3: Cloud 部署

| 平台 | 说明 |
|------|------|
| **Railway** | 最简单，支持自动部署 |
| **Render** | 免费层可用 |
| **Fly.io** | 全球部署 |
| **AWS/Azure/GCP** | 企业级 |

---

## 🚀 快速开始

### 第一次部署

```bash
# 1. 本地测试
docker-compose up -d
curl http://localhost:3000/health

# 2. 运行测试
bash scripts/test-api.sh

# 3. 提交到 GitHub
git add .
git commit -m "Setup CI/CD"
git push

# 4. 等待 GitHub Actions 完成检查

# 5. 部署到生产环境
# （选择上面的部署选项之一）
```

---

## 📝 Nginx 反向代理配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔍 监控和日志

### 查看日志

```bash
# Docker Compose
docker-compose logs -f api

# 单个容器
docker logs -f accounting-api

# 查看最近 100 行
docker-compose logs --tail=100 api
```

### 健康检查

```bash
# 检查服务状态
curl http://your-domain.com/health

# 检查数据库连接
docker exec accounting-db pg_isready -U admin
```

---

## 📚 下一步

- [ ] 添加单元测试（Jest）
- [ ] 配置 ESLint 和 Prettier
- [ ] 添加 HTTPS（Let's Encrypt）
- [ ] 配置自动备份
- [ ] 添加监控和告警

---

## 🆘 故障排查

### 数据库连接失败

```bash
# 检查数据库是否健康
docker exec accounting-db pg_isready -U admin

# 查看数据库日志
docker logs accounting-db
```

### API 无法启动

```bash
# 检查环境变量
docker-compose config

# 查看详细日志
docker-compose logs api
```

---

**需要帮助？** 检查 GitHub Actions 日志或提交 Issue。
