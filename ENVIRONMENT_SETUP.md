# 🔧 環境變數配置指南

## 🚨 當前問題解決

根據您的部署日誌，有兩個問題需要解決：

### 1. SSL 連接問題
**錯誤**: `Error: The server does not support SSL connections`

### 2. SendGrid API Key 格式問題  
**錯誤**: `API key does not start with "SG."`

## 📋 完整的環境變數配置

### API 服務環境變數：

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://root:i1Ec4S3sY0AtnO2vTypCh8Z6U57V9DPg@sjc1.clusters.zeabur.com:31843/zeabur
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@amazefashion.com.tw
SENDGRID_FROM_NAME=Amaze Fashion
JWT_SECRET=E7jLV0rW9SfXB3enuw2hg6aYI8T1H4o5
CLIENT_URL=https://email-editor-client.zeabur.app
```

### 前端服務環境變數：

```env
REACT_APP_API_URL=https://email-editor-api.zeabur.app/api
```

## 🔑 SendGrid API Key 獲取步驟

### 1. 登入 SendGrid
前往 [SendGrid Dashboard](https://app.sendgrid.com)

### 2. 創建 API Key
1. 點擊 **Settings** > **API Keys**
2. 點擊 **Create API Key**
3. 選擇 **Restricted Access**
4. 設置權限：
   - ✅ **Mail Send**: Full Access
   - ✅ **Mail Settings**: Read Access  
   - ✅ **Stats**: Read Access
   - ✅ **Suppressions**: Read Access
   - ❌ 其他權限：No Access
5. 命名為 "Email Editor API Key"
6. **複製生成的 API Key**（應該以 "SG." 開頭）

### 3. 設置環境變數
將複製的 API Key 設置到 `SENDGRID_API_KEY` 環境變數中。

## 🗄️ 數據庫連接修復

我已經更新了數據庫配置來修復 SSL 問題。新的配置會：
- 在生產環境中禁用 SSL 要求
- 允許不安全的連接（適用於 Zeabur 內部網絡）

## 📝 部署步驟

### 1. 更新環境變數
在 Zeabur Dashboard 中更新您的 API 服務環境變數：

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://root:i1Ec4S3sY0AtnO2vTypCh8Z6U57V9DPg@sjc1.clusters.zeabur.com:31843/zeabur
SENDGRID_API_KEY=SG.您的實際API密鑰
SENDGRID_FROM_EMAIL=noreply@amazefashion.com.tw
SENDGRID_FROM_NAME=Amaze Fashion
JWT_SECRET=E7jLV0rW9SfXB3enuw2hg6aYI8T1H4o5
CLIENT_URL=https://email-editor-client.zeabur.app
```

### 2. 重新部署
更新環境變數後，服務會自動重新部署。

### 3. 檢查部署狀態
等待服務重新啟動，檢查日誌確認：
- ✅ 數據庫連接成功
- ✅ SendGrid API Key 驗證成功
- ✅ 服務器啟動成功

## 🎯 預期結果

部署成功後，您應該看到：
```
✅ 數據庫連接成功
✅ 數據庫表初始化完成
🚀 服務器運行在端口 5000
📧 Email Editor API 已啟動
☁️ 運行在雲端環境 (Zeabur)
```

## 🔗 下一步

1. **獲取 SendGrid API Key**
2. **更新環境變數**
3. **等待重新部署**
4. **部署前端服務**
5. **配置 SendGrid Webhook**
6. **測試系統功能**

---

**注意**: 請確保 SendGrid API Key 以 "SG." 開頭，這是 SendGrid 的標準格式。
