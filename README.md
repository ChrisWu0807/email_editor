# Email Editor - 郵件編輯器

一個功能完整的郵件編輯器系統，支援模板創建、活動發送和統計分析。

## 功能特色

### 📧 郵件編輯
- 基於 TinyMCE 的所見即所得編輯器
- 支援 HTML 和純文本格式
- 模板管理和複製功能
- 響應式設計

### 📊 活動管理
- 創建和發送郵件活動
- 收件人列表管理
- 發送前預覽功能
- 活動狀態追蹤

### 📈 統計分析
- 實時統計數據展示
- 開信率、點擊率、退訂率分析
- 時間序列數據圖表
- SendGrid Webhook 整合

### 🔐 用戶認證
- JWT 認證系統
- 用戶註冊和登入
- 個人資料管理

## 技術棧

### 後端
- **Node.js** + **Express.js** - 服務器框架
- **PostgreSQL** - 數據庫
- **SendGrid** - 郵件發送服務
- **JWT** - 認證
- **bcryptjs** - 密碼加密

### 前端
- **React** + **TypeScript** - 前端框架
- **Tailwind CSS** - 樣式框架
- **TinyMCE** - 富文本編輯器
- **Chart.js** - 圖表庫
- **React Router** - 路由管理

## 本地開發

### 環境要求
- Node.js 16+
- PostgreSQL 12+
- SendGrid API Key

### 安裝步驟

1. **克隆項目**
   ```bash
   git clone <your-repo-url>
   cd email_editor
   ```

2. **安裝依賴**
   ```bash
   # 安裝後端依賴
   npm install
   
   # 安裝前端依賴
   cd client
   npm install
   cd ..
   ```

3. **設置環境變數**
   ```bash
   cp env.example .env
   ```
   
   編輯 `.env` 文件，填入以下配置：
   ```env
   # 數據庫配置
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=email_editor
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   
   # SendGrid 配置
   SENDGRID_API_KEY=your_sendgrid_api_key
   SENDGRID_FROM_EMAIL=your-email@example.com
   SENDGRID_FROM_NAME=Your Company
   
   # JWT 密鑰
   JWT_SECRET=your_jwt_secret
   
   # 服務器配置
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

4. **設置數據庫**
   ```bash
   # 創建 PostgreSQL 數據庫
   createdb email_editor
   
   # 執行數據庫遷移
   psql email_editor < database/schema.sql
   ```

5. **啟動開發服務器**
   ```bash
   # 同時啟動前後端
   npm run dev
   
   # 或分別啟動
   npm run server  # 後端 (端口 5000)
   npm run client  # 前端 (端口 3000)
   ```

## Zeabur 部署

### 部署步驟

1. **推送代碼到 GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **在 Zeabur 創建項目**
   - 登入 [Zeabur Dashboard](https://dash.zeabur.com)
   - 點擊 "New Project"
   - 選擇 "Deploy from GitHub"
   - 選擇你的 GitHub 倉庫

3. **配置服務**
   
   **API 服務配置：**
   - 服務名稱：`email-editor-api`
   - 構建命令：`npm install`
   - 啟動命令：`npm run server`
   - 端口：`5000`

   **前端服務配置：**
   - 服務名稱：`email-editor-client`
   - 構建命令：`cd client && npm install && npm run build`
   - 啟動命令：`cd client && npx serve -s build -l 3000`
   - 端口：`3000`

4. **添加 PostgreSQL 數據庫**
   - 在項目中點擊 "Add Database"
   - 選擇 "PostgreSQL"
   - 記下數據庫連接信息

5. **設置環境變數**
   
   在 Zeabur Dashboard 中設置以下環境變數：
   
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

6. **部署和測試**
   - 點擊 "Deploy" 開始部署
   - 等待構建完成
   - 訪問你的應用 URL 進行測試

### SendGrid 配置

1. **獲取 API Key**
   - 登入 [SendGrid Dashboard](https://app.sendgrid.com)
   - 前往 Settings > API Keys
   - 創建新的 API Key（Full Access）

2. **設置 Webhook**
   - 前往 Settings > Mail Settings > Event Webhook
   - 設置 Webhook URL：`https://your-api-app.zeabur.app/api/webhooks/sendgrid`
   - 選擇要追蹤的事件：
     - Delivered
     - Open
     - Click
     - Bounce
     - Unsubscribe
     - Spam Report

3. **驗證發件人**
   - 前往 Settings > Sender Authentication
   - 驗證你的發件人郵箱或域名

## API 文檔

### 認證端點
- `POST /api/auth/login` - 用戶登入
- `POST /api/auth/register` - 用戶註冊
- `GET /api/auth/me` - 獲取當前用戶信息

### 模板端點
- `GET /api/templates` - 獲取所有模板
- `POST /api/templates` - 創建新模板
- `PUT /api/templates/:id` - 更新模板
- `DELETE /api/templates/:id` - 刪除模板

### 活動端點
- `GET /api/campaigns` - 獲取所有活動
- `POST /api/campaigns` - 創建新活動
- `POST /api/campaigns/:id/send` - 發送活動
- `POST /api/campaigns/:id/preview` - 預覽郵件

### 統計端點
- `GET /api/statistics/campaign/:id` - 獲取活動統計
- `GET /api/statistics/overview` - 獲取總體統計

### Webhook 端點
- `POST /api/webhooks/sendgrid` - SendGrid 事件處理

## 項目結構

```
email_editor/
├── client/                 # React 前端應用
│   ├── public/
│   ├── src/
│   │   ├── components/     # React 組件
│   │   ├── pages/         # 頁面組件
│   │   ├── contexts/      # React Context
│   │   ├── services/      # API 服務
│   │   ├── types/         # TypeScript 類型
│   │   └── App.tsx
│   └── package.json
├── config/                # 配置文件
│   └── database.js
├── database/              # 數據庫相關
│   └── schema.sql
├── routes/                # API 路由
│   ├── auth.js
│   ├── templates.js
│   ├── campaigns.js
│   ├── statistics.js
│   └── webhooks.js
├── services/              # 業務邏輯服務
│   └── sendgrid.js
├── server.js              # 服務器入口
├── package.json
├── zeabur.json           # Zeabur 部署配置
└── README.md
```

## 貢獻指南

1. Fork 本項目
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 授權

本項目採用 MIT 授權 - 查看 [LICENSE](LICENSE) 文件了解詳情。

## 支援

如有問題或建議，請提交 [Issue](https://github.com/your-username/email_editor/issues)。
