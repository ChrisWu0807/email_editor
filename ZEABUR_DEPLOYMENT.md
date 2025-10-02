# Zeabur 部署指南

## 🚀 快速部署步驟

### 1. 創建 Zeabur 項目

1. 登入 [Zeabur Dashboard](https://dash.zeabur.com)
2. 點擊 **"New Project"**
3. 輸入項目名稱：`email-editor`
4. 點擊 **"Create Project"**

### 2. 添加 PostgreSQL 數據庫

1. 在項目中點擊 **"Add Database"**
2. 選擇 **"PostgreSQL"**
3. 數據庫名稱：`email_editor_db`
4. 點擊 **"Add Database"**
5. **重要**：記下生成的 `DATABASE_URL`，稍後會用到

### 3. 部署 API 服務

1. 點擊 **"Add Service"**
2. 選擇 **"Deploy from GitHub"**
3. 選擇倉庫：`ChrisWu0807/email_editor`
4. 分支：`main`
5. 服務名稱：`email-editor-api`

**構建配置：**
- **Build Command**: `npm install --omit=dev`
- **Start Command**: `node server.js`
- **Port**: `5000`

**環境變數設置：**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=<從步驟2獲取的PostgreSQL連接字符串>
SENDGRID_API_KEY=<您的SendGrid API Key>
SENDGRID_FROM_EMAIL=noreply@amazefashion.com.tw
SENDGRID_FROM_NAME=Amaze Fashion
JWT_SECRET=<生成一個隨機字符串，例如：your-super-secret-jwt-key-here>
CLIENT_URL=https://email-editor-client.zeabur.app
```

### 4. 部署前端服務

1. 再次點擊 **"Add Service"**
2. 選擇 **"Deploy from GitHub"**
3. 選擇倉庫：`ChrisWu0807/email_editor`
4. 分支：`main`
5. 服務名稱：`email-editor-client`

**構建配置：**
- **Build Command**: `cd client && npm install && npm run build`
- **Start Command**: `cd client && npx serve -s build -l 3000`
- **Port**: `3000`

**環境變數設置：**
```env
REACT_APP_API_URL=https://email-editor-api.zeabur.app/api
```

### 5. 等待部署完成

1. 兩個服務都會開始自動構建和部署
2. 等待構建狀態變為 **"Running"**
3. 記錄生成的 URL：
   - API 服務 URL：`https://email-editor-api.zeabur.app`
   - 前端服務 URL：`https://email-editor-client.zeabur.app`

### 6. 配置 SendGrid Webhook

1. 登入 [SendGrid Dashboard](https://app.sendgrid.com)
2. 前往 **Settings** > **Mail Settings** > **Event Webhook**
3. 設置 Webhook URL：`https://email-editor-api.zeabur.app/api/webhooks/sendgrid`
4. 選擇要追蹤的事件：
   - ✅ **Processed**
   - ✅ **Delivered**
   - ✅ **Open**
   - ✅ **Click**
   - ✅ **Bounce**
   - ✅ **Unsubscribe**
   - ✅ **Spam Report**

### 7. 測試部署

1. 訪問前端 URL：`https://email-editor-client.zeabur.app`
2. 註冊測試帳戶
3. 創建郵件模板
4. 發送測試郵件
5. 檢查統計功能

## 🔧 故障排除

### 常見問題

**1. 構建失敗 - npm ci 錯誤**
- ✅ 已修復：改用 `npm install --omit=dev`
- 確保 package.json 和 package-lock.json 存在

**2. 數據庫連接失敗**
- 檢查 DATABASE_URL 是否正確設置
- 確認 PostgreSQL 服務正在運行
- 檢查環境變數是否正確

**3. SendGrid API 錯誤**
- 確認 SENDGRID_API_KEY 正確
- 檢查發件人郵箱是否已驗證
- 確認 API Key 有足夠權限

**4. 前端無法連接後端**
- 檢查 REACT_APP_API_URL 環境變數
- 確認 API 服務正在運行
- 檢查 CORS 配置

### 檢查服務狀態

1. 在 Zeabur Dashboard 中查看服務狀態
2. 點擊服務查看日誌
3. 檢查健康檢查狀態

## 📝 部署後檢查清單

- [ ] PostgreSQL 數據庫已創建並運行
- [ ] API 服務部署成功並運行
- [ ] 前端服務部署成功並運行
- [ ] 所有環境變數已正確設置
- [ ] SendGrid Webhook 已配置
- [ ] 可以訪問前端應用
- [ ] 可以註冊新用戶
- [ ] 可以創建郵件模板
- [ ] 可以發送測試郵件
- [ ] 統計數據正常顯示

## 🎉 部署完成！

完成以上步驟後，您的 Email Editor 系統就成功部署到 Zeabur 了！

**訪問地址：**
- 前端應用：`https://email-editor-client.zeabur.app`
- API 服務：`https://email-editor-api.zeabur.app`

**下一步：**
1. 配置您的 SendGrid API Key
2. 測試所有功能
3. 開始使用您的郵件編輯器系統！
