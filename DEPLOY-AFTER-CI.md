# GitHub Actions 构建产物使用指南

## 📦 当前工作流程

```
代码推送 → GitHub Actions → 构建 Docker 镜像 → 推送到 GHCR → 可直接使用
```

---

## 🚀 使用构建好的镜像

### 方法 1: 使用 GHCR (GitHub Container Registry)

**1. 登录到 GitHub Container Registry**

```bash
# 使用 GitHub CLI
echo "你的_GITHUB_PAT" | docker login ghcr.io -u 你的用户名 --password-stdin

# 或者使用 GitHub Token
docker login ghcr.io
```

**2. 拉取镜像**

```bash
docker pull ghcr.io/chowhound-g/my-accounting-app:main
```

**3. 运行容器**

```bash
docker run -d \
  --name accounting-api \
  -p 3000:3000 \
  -e DB_HOST=your-db-host \
  -e DB_PASSWORD=your-password \
  ghcr.io/chowhound-g/my-accounting-app:main
```

**4. 使用 Docker Compose（推荐）**

```bash
# 生产环境部署
docker-compose -f docker-compose.prod.yml up -d

# 更新到最新版本
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔄 自动化部署流程

### 方案 A: 推送后自动部署（到你的服务器）

在服务器上设置脚本：

```bash
#!/bin/bash
# ~/update-app.sh

cd /path/to/my-accounting-app

# 拉取最新镜像
docker-compose -f docker-compose.prod.yml pull

# 重启服务
docker-compose -f docker-compose.prod.yml up -d

# 清理旧镜像
docker image prune -af
```

设置定时任务或 webhook：
```bash
# 每小时检查一次更新
crontab -e
0 * * * * /home/user/update-app.sh
```

### 方案 B: 部署到云平台

**Railway** (最简单):
```bash
# 安装 Railway CLI
npm install -g railway

# 登录并部署
railway login
railway init
railway up
```

**Render** (免费):
1. 连接 GitHub 仓库
2. 选择 Dockerfile
3. 自动部署

**Fly.io** (全球部署):
```bash
fly launch
fly deploy
```

---

## 📊 查看可用的镜像版本

访问 GitHub Packages 页面：
```
https://github.com/Chowhound-G/my-accounting-app/pkgs/container/my-accounting-app
```

可以看到所有构建的镜像版本。

---

## 🎯 典型使用场景

### 场景 1: 本地开发

```bash
# 拉取最新镜像
docker pull ghcr.io/chowhound-g/my-accounting-app:main

# 运行测试
docker run --rm ghcr.io/chowhound-g/my-accounting-app:main npm test
```

### 场景 2: 生产服务器部署

```bash
# 一键部署脚本
#!/bin/bash
set -e

echo "🔄 Pulling latest image..."
docker pull ghcr.io/chowhound-g/my-accounting-app:main

echo "🚀 Deploying..."
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Deployment complete!"
echo "🌐 App running at: http://localhost:3000"
```

### 场景 3: 多环境部署

```bash
# 开发环境
docker-compose -f docker-compose.dev.yml up -d

# 生产环境
docker-compose -f docker-compose.prod.yml up -d

# 测试环境
docker-compose -f docker-compose.test.yml up -d
```

---

## 🔧 配置 GitHub Actions 自动推送

目前配置文件已创建：`.github/workflows/build-and-push.yml`

推送后生效：
```bash
git add .
git commit -m "feat: 添加自动构建和推送镜像"
git push
```

---

## 💡 下一步建议

1. **启用构建推送 workflow**
   ```bash
   git add .github/workflows/build-and-push.yml
   git push
   ```

2. **在服务器上配置部署脚本**
   ```bash
   # 创建 deploy.sh
   # 设置定时任务或 webhook
   ```

3. **选择云平台**（可选）
   - Railway: 最简单
   - Render: 有免费层
   - Fly.io: 全球部署

---

**需要我帮你配置自动部署吗？**
