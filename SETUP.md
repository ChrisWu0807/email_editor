# Email Editor 設置指南

## 快速開始

### 1. 環境準備

**本地開發環境：**
```bash
# 安裝 Node.js 16+ 和 PostgreSQL 12+
# 獲取 SendGrid API Key

# 克隆項目
git clone <your-repo>
cd email_editor

# 安裝依賴
npm install
cd client && npm install && cd ..
```

### 2. 環境變數設置

**複製環境變數模板：**
```bash
cp env.example .env
cp client/.env.example client/.env
```

**配置 `.env` 文件：**
```env
# 數據庫配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=email_editor
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# SendGrid 配置
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=your-email@example.com
SENDGRID_FROM_NAME=Your Company Name

# JWT 密鑰
JWT_SECRET=your_jwt_secret_here

# 服務器配置
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**配置 `client/.env` 文件：**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. 數據庫設置

```bash
# 創建數據庫
createdb email_editor

# 執行數據庫遷移
psql email_editor < database/schema.sql
```

### 4. 啟動應用

```bash
# 同時啟動前後端
npm run dev

# 或分別啟動
npm run server  # 後端 (http://localhost:5000)
npm run client  # 前端 (http://localhost:3000)
```

## SendGrid 配置

### 1. 獲取 API Key
1. 登入 [SendGrid Dashboard](https://app.sendgrid.com)
2. 前往 Settings > API Keys
3. 創建新的 API Key（Full Access）
4. 複製 API Key 到環境變數

### 2. 設置 Webhook
1. 前往 Settings > Mail Settings > Event Webhook
2. 設置 Webhook URL：`https://your-domain.com/api/webhooks/sendgrid`
3. 選擇要追蹤的事件：
   - ✅ Delivered
   - ✅ Open
   - ✅ Click
   - ✅ Bounce
   - ✅ Unsubscribe
   - ✅ Spam Report

### 3. 驗證發件人
1. 前往 Settings > Sender Authentication
2. 驗證你的發件人郵箱或域名

## Zeabur 部署

### 1. 準備部署
```bash
# 推送代碼到 GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. 在 Zeabur 創建服務

**API 服務：**
- 服務名稱：`email-editor-api`
- 源代碼：選擇你的 GitHub 倉庫
- 構建命令：`npm install`
- 啟動命令：`npm run server`
- 端口：`5000`

**前端服務：**
- 服務名稱：`email-editor-client`
- 源代碼：選擇你的 GitHub 倉庫
- 構建命令：`cd client && npm install && npm run build`
- 啟動命令：`cd client && npx serve -s build -l 3000`
- 端口：`3000`

### 3. 添加數據庫
1. 在項目中點擊 "Add Database"
2. 選擇 "PostgreSQL"
3. 記下連接字符串

### 4. 設置環境變數

**API 服務環境變數：**
```
NODE_ENV=production
PORT=5000
DATABASE_URL=<postgres-connection-string>
SENDGRID_API_KEY=<your-sendgrid-api-key>
SENDGRID_FROM_EMAIL=<your-email>
SENDGRID_FROM_NAME=<your-company>
JWT_SECRET=<your-jwt-secret>
CLIENT_URL=https://your-client-app.zeabur.app
```

**前端服務環境變數：**
```
REACT_APP_API_URL=https://your-api-app.zeabur.app/api
```

### 5. 部署和測試
1. 點擊 "Deploy" 開始部署
2. 等待構建完成
3. 更新 SendGrid Webhook URL 為新的 API 地址
4. 訪問應用進行測試

## 功能特色

### 📧 郵件編輯
- 基於 TinyMCE 的富文本編輯器
- 模板管理和複製功能
- HTML 和純文本支援
- 響應式設計

### 📊 活動管理
- 創建和發送郵件活動
- 收件人列表管理
- 發送前預覽功能
- 測試郵件發送

### 📈 統計分析
- 實時統計數據展示
- 開信率、點擊率分析
- SendGrid Webhook 整合
- 詳細的收件人狀態追蹤

### 🔐 用戶認證
- JWT 認證系統
- 用戶註冊和登入
- 個人資料管理
- 密碼修改功能

## API 端點

### 認證
- `POST /api/auth/login` - 用戶登入
- `POST /api/auth/register` - 用戶註冊
- `GET /api/auth/me` - 獲取當前用戶信息

### 模板
- `GET /api/templates` - 獲取所有模板
- `POST /api/templates` - 創建新模板
- `PUT /api/templates/:id` - 更新模板
- `DELETE /api/templates/:id` - 刪除模板

### 活動
- `GET /api/campaigns` - 獲取所有活動
- `POST /api/campaigns` - 創建新活動
- `POST /api/campaigns/:id/send` - 發送活動
- `POST /api/campaigns/:id/preview` - 預覽郵件

### 統計
- `GET /api/statistics/campaign/:id` - 獲取活動統計
- `GET /api/statistics/overview` - 獲取總體統計

### Webhook
- `POST /api/webhooks/sendgrid` - SendGrid 事件處理

## 故障排除

### 常見問題

1. **數據庫連接失敗**
   - 檢查 PostgreSQL 是否運行
   - 確認數據庫連接信息正確
   - 檢查數據庫是否存在

2. **SendGrid API 錯誤**
   - 確認 API Key 正確
   - 檢查發件人是否已驗證
   - 確認 API Key 有足夠權限

3. **前端無法連接後端**
   - 檢查 REACT_APP_API_URL 環境變數
   - 確認後端服務正在運行
   - 檢查 CORS 配置

4. **Webhook 不工作**
   - 確認 Webhook URL 可訪問
   - 檢查 SendGrid 事件設置
   - 查看服務器日誌

### 日誌查看
```bash
# 本地開發
npm run server

# 生產環境
# 在 Zeabur Dashboard 查看服務日誌
```

## 技術支援

如有問題，請：
1. 查看本文檔的故障排除部分
2. 檢查 GitHub Issues
3. 聯繫技術支援

---

🎉 恭喜！您已經成功設置了 Email Editor 系統！
