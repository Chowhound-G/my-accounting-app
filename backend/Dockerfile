FROM node:18-alpine

WORKDIR /app

# 先配置国内 npm 镜像（关键！）
RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["npm", "start"]