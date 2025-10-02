# 多階段構建 Dockerfile for Zeabur 部署

# 第一階段：構建前端
FROM node:18-alpine AS frontend-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install

COPY client/ ./
RUN npm run build

# 第二階段：構建後端
FROM node:18-alpine AS backend-build

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

COPY . .
COPY --from=frontend-build /app/client/build ./client/build

# 第三階段：生產環境
FROM node:18-alpine AS production

WORKDIR /app

# 安裝 serve 來提供靜態文件
RUN npm install -g serve

# 複製構建好的文件
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/server.js ./
COPY --from=backend-build /app/config ./config
COPY --from=backend-build /app/routes ./routes
COPY --from=backend-build /app/services ./services
COPY --from=backend-build /app/database ./database
COPY --from=backend-build /app/client/build ./client/build

# 暴露端口
EXPOSE 5000

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 啟動命令
CMD ["node", "server.js"]
