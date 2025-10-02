# SendGrid 配置指南 - Amazefashion.com.tw

## 域名配置檢查

### 1. 確認 DNS 記錄

請在 Cloudflare 上確認以下 CNAME 記錄是否正確設置：

```
類型: CNAME
名稱: s1._domainkey
目標: s1.domainkey.u[USER_ID].wl[WEBHOOK_ID].sendgrid.net

類型: CNAME  
名稱: s2._domainkey
目標: s2.domainkey.u[USER_ID].wl[WEBHOOK_ID].sendgrid.net

類型: CNAME
名稱: em[USER_ID]
目標: u[USER_ID].wl[WEBHOOK_ID].sendgrid.net
```

**注意：** 請將 `[USER_ID]` 和 `[WEBHOOK_ID]` 替換為您 SendGrid 帳戶中的實際 ID。

### 2. SPF 記錄

確認 SPF 記錄包含 SendGrid：
```
類型: TXT
名稱: @
內容: v=spf1 include:sendgrid.net ~all
```

### 3. DMARC 記錄（可選但建議）

```
類型: TXT
名稱: _dmarc
內容: v=DMARC1; p=quarantine; rua=mailto:dmarc@amazefashion.com.tw
```

## API Key 設置

### 1. 創建專用 API Key

1. 登入 [SendGrid Dashboard](https://app.sendgrid.com)
2. 前往 **Settings** > **API Keys**
3. 點擊 **Create API Key**
4. 選擇 **Restricted Access**
5. 設置權限：
   - ✅ **Mail Send**: Full Access
   - ✅ **Mail Settings**: Read Access
   - ✅ **Stats**: Read Access
   - ✅ **Suppressions**: Read Access
   - ❌ 其他權限：No Access
6. 命名為 "Email Editor API Key"
7. 複製生成的 API Key

### 2. 域名認證狀態

1. 前往 **Settings** > **Sender Authentication**
2. 確認 `amazefashion.com.tw` 域名狀態為 **Verified**
3. 如果未驗證，請按照指示完成驗證

## Webhook 配置

### 1. 設置 Event Webhook

1. 前往 **Settings** > **Mail Settings** > **Event Webhook**
2. 設置 Webhook URL：`https://your-zeabur-api-url.zeabur.app/api/webhooks/sendgrid`
3. 選擇要追蹤的事件：
   - ✅ **Processed**
   - ✅ **Delivered** 
   - ✅ **Open**
   - ✅ **Click**
   - ✅ **Bounce**
   - ✅ **Unsubscribe**
   - ✅ **Spam Report**

### 2. 測試 Webhook

部署完成後，可以發送測試郵件來驗證 Webhook 是否正常工作。

## 環境變數設置

在 Zeabur 部署時，請設置以下環境變數：

```env
# SendGrid 配置
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@amazefashion.com.tw
SENDGRID_FROM_NAME=Amaze Fashion

# 其他配置
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret-here
```

## 發件人設置

系統將使用以下發件人信息：
- **發件人郵箱**: noreply@amazefashion.com.tw
- **發件人名稱**: Amaze Fashion

如果需要修改，請更新環境變數 `SENDGRID_FROM_EMAIL` 和 `SENDGRID_FROM_NAME`。

## 測試建議

1. **域名測試**: 使用 SendGrid 的測試功能確認域名配置
2. **API 測試**: 發送測試郵件確認 API Key 正常工作
3. **Webhook 測試**: 檢查 Zeabur 日誌確認事件正常接收

## 故障排除

### 常見問題

1. **郵件被標記為垃圾郵件**
   - 檢查 SPF 記錄
   - 確認域名認證狀態
   - 檢查發件人聲譽

2. **Webhook 不工作**
   - 確認 URL 可訪問
   - 檢查 HTTPS 證書
   - 查看 SendGrid 事件日誌

3. **API Key 權限不足**
   - 檢查 API Key 權限設置
   - 確認有 Mail Send 權限

---

✅ 完成以上配置後，您的 Email Editor 系統就可以正常使用 `amazefashion.com.tw` 域名發送郵件了！
