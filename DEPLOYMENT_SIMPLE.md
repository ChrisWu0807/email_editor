# 簡化部署指南 - 不使用 Dockerfile

## 🚀 在 Zeabur 手動部署

### 1. 創建項目

1. 登入 [Zeabur Dashboard](https://dash.zeabur.com)
2. 點擊 **"New Project"**
3. 項目名稱：`email-editor`

### 2. 添加 PostgreSQL 數據庫

1. 點擊 **"Add Database"**
2. 選擇 **"PostgreSQL"**
3. 記下 `DATABASE_URL`

### 3. 部署 API 服務

1. 點擊 **"Add Service"**
2. 選擇 **"Deploy from GitHub"**
3. 倉庫：`ChrisWu0807/email_editor`
4. 分支：`main`

**配置：**
- **Name**: `email-editor-api`
- **Build Command**: `npm install --omit=dev`
- **Start Command**: `node server.js`
- **Port**: `5000`

**環境變數：**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=<PostgreSQL連接字符串>
SENDGRID_API_KEY=<您的API Key>
SENDGRID_FROM_EMAIL=noreply@amazefashion.com.tw
SENDGRID_FROM_NAME=Amaze Fashion
JWT_SECRET=<隨機字符串>
CLIENT_URL=https://email-editor-client.zeabur.app
```

### 4. 部署前端服務

1. 再次點擊 **"Add Service"**
2. 選擇 **"Deploy from GitHub"**
3. 倉庫：`ChrisWu0807/email_editor`
4. 分支：`main`

**配置：**
- **Name**: `email-editor-client`
- **Build Command**: `cd client && npm install && npm run build`
- **Start Command**: `cd client && npx serve -s build -l 3000`
- **Port**: `3000`

**環境變數：**
```env
REACT_APP_API_URL=https://email-editor-api.zeabur.app/api
```

### 5. 等待部署完成

1. 等待兩個服務都顯示 **"Running"** 狀態
2. 記錄生成的 URL

### 6. 配置 SendGrid Webhook

Webhook URL: `https://email-editor-api.zeabur.app/api/webhooks/sendgrid`

## 📝 重要提醒

- 不要使用 Dockerfile，直接使用構建命令
- 確保環境變數正確設置
- 等待構建完成後再測試

## 🎉 完成！

訪問前端 URL 開始使用您的 Email Editor 系統！
