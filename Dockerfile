# 統一部署 Dockerfile - 前端 + 後端一起
FROM node:18-alpine

# 設置工作目錄
WORKDIR /app

# 複製後端文件
COPY package*.json ./
COPY server.js ./
COPY config/ ./config/
COPY routes/ ./routes/
COPY services/ ./services/
COPY database/ ./database/

# 安裝後端依賴
RUN npm install --omit=dev

# 複製客戶端文件
COPY client/ ./client/

# 安裝前端依賴並構建
WORKDIR /app/client
RUN ls -la
RUN cat package.json
RUN npm install
RUN npm run build
WORKDIR /app

# 暴露端口
EXPOSE 5000

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 啟動命令
CMD ["node", "server.js"]