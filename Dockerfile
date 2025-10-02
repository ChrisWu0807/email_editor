# 簡化的 Dockerfile for Zeabur 部署 - 僅後端
FROM node:18-alpine

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝後端依賴
RUN npm install --omit=dev

# 複製後端代碼
COPY server.js ./
COPY config/ ./config/
COPY routes/ ./routes/
COPY services/ ./services/
COPY database/ ./database/

# 暴露端口
EXPOSE 5000

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 啟動命令
CMD ["node", "server.js"]