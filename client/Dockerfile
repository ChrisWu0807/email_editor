# 前端專用 Dockerfile
FROM node:18-alpine

# 安裝 serve
RUN npm install -g serve

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製源代碼
COPY . ./

# 構建應用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 啟動命令
CMD ["serve", "-s", "build", "-l", "3000"]
