# 🚀 最終部署指南 - 手動部署（推薦）

## 問題解決方案

由於 Dockerfile 的複雜性，我們建議使用 **手動部署** 方式，這是最可靠的方法。

## 📋 部署步驟

### 1. 在 Zeabur 創建項目

1. 登入 [Zeabur Dashboard](https://dash.zeabur.com)
2. 點擊 **"New Project"**
3. 項目名稱：`email-editor`

### 2. 添加 PostgreSQL 數據庫

1. 點擊 **"Add Database"**
2. 選擇 **"PostgreSQL"**
3. 數據庫名稱：`email_editor_db`
4. **重要**：複製 `DATABASE_URL` 連接字符串

### 3. 部署 API 服務

1. 點擊 **"Add Service"**
2. 選擇 **"Deploy from GitHub"**
3. 倉庫：`ChrisWu0807/email_editor`
4. 分支：`main`

**配置設置：**
- **Name**: `email-editor-api`
- **Build Command**: `npm install --omit=dev`
- **Start Command**: `node server.js`
- **Port**: `5000`

**環境變數：**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=<從步驟2複製的PostgreSQL連接字符串>
SENDGRID_API_KEY=<您的SendGrid API Key>
SENDGRID_FROM_EMAIL=noreply@amazefashion.com.tw
SENDGRID_FROM_NAME=Amaze Fashion
JWT_SECRET=<生成一個隨機字符串，例如：my-super-secret-jwt-key-2024>
CLIENT_URL=https://email-editor-client.zeabur.app
```

### 4. 部署前端服務

1. 再次點擊 **"Add Service"**
2. 選擇 **"Deploy from GitHub"**
3. 倉庫：`ChrisWu0807/email_editor`
4. 分支：`main`

**配置設置：**
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
2. 記錄生成的 URL：
   - API: `https://email-editor-api.zeabur.app`
   - 前端: `https://email-editor-client.zeabur.app`

### 6. 配置 SendGrid Webhook

1. 登入 [SendGrid Dashboard](https://app.sendgrid.com)
2. 前往 **Settings** > **Mail Settings** > **Event Webhook**
3. 設置 Webhook URL：`https://email-editor-api.zeabur.app/api/webhooks/sendgrid`
4. 選擇事件：
   - ✅ **Processed**
   - ✅ **Delivered**
   - ✅ **Open**
   - ✅ **Click**
   - ✅ **Bounce**
   - ✅ **Unsubscribe**
   - ✅ **Spam Report**

## 🎯 重要提醒

### ✅ 使用手動部署
- **不要使用 Dockerfile**
- **直接使用構建命令**
- **分別部署前端和後端**

### ✅ 環境變數檢查清單
- [ ] DATABASE_URL 已設置
- [ ] SENDGRID_API_KEY 已設置
- [ ] JWT_SECRET 已設置
- [ ] REACT_APP_API_URL 已設置

### ✅ 測試檢查清單
- [ ] API 服務運行正常
- [ ] 前端服務運行正常
- [ ] 可以訪問前端 URL
- [ ] 可以註冊新用戶
- [ ] 可以創建郵件模板
- [ ] 可以發送測試郵件

## 🚨 故障排除

### 如果部署失敗：
1. 檢查構建命令是否正確
2. 確認環境變數已設置
3. 查看構建日誌中的錯誤信息
4. 確保 GitHub 倉庫可以訪問

### 如果前端無法連接後端：
1. 檢查 REACT_APP_API_URL 環境變數
2. 確認 API 服務正在運行
3. 檢查 API URL 是否可訪問

## 🎉 完成！

部署完成後，您就可以開始使用 Email Editor 系統了！

**訪問地址：**
- 前端：`https://email-editor-client.zeabur.app`
- API：`https://email-editor-api.zeabur.app`

---

**注意：** 如果您遇到任何問題，請參考構建日誌中的具體錯誤信息，或者聯繫我們獲取幫助。
