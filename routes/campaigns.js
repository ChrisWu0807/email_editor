const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const sendGridService = require('../services/sendgrid');
const { authenticateToken } = require('./auth');

// 所有路由都需要認證
router.use(authenticateToken);

// 獲取所有活動
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, t.name as template_name,
              (SELECT COUNT(*) FROM recipients WHERE campaign_id = c.id) as recipient_count,
              (SELECT COUNT(*) FROM recipients WHERE campaign_id = c.id AND status = 'sent') as sent_count
       FROM campaigns c
       LEFT JOIN email_templates t ON c.template_id = t.id
       WHERE c.user_id = $1 
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, campaigns: result.rows });
  } catch (error) {
    console.error('獲取活動失敗:', error);
    res.status(500).json({ success: false, error: '獲取活動失敗' });
  }
});

// 獲取單個活動
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, t.name as template_name
       FROM campaigns c
       LEFT JOIN email_templates t ON c.template_id = t.id
       WHERE c.id = $1 AND c.user_id = $2`,
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: '活動不存在' });
    }

    // 獲取收件人列表
    const recipientsResult = await query(
      'SELECT * FROM recipients WHERE campaign_id = $1 ORDER BY created_at',
      [req.params.id]
    );

    res.json({ 
      success: true, 
      campaign: result.rows[0],
      recipients: recipientsResult.rows
    });
  } catch (error) {
    console.error('獲取活動失敗:', error);
    res.status(500).json({ success: false, error: '獲取活動失敗' });
  }
});

// 創建新活動
router.post('/', async (req, res) => {
  try {
    const { name, subject, htmlContent, textContent, templateId, recipients } = req.body;
    
    if (!name || !subject || !htmlContent || !recipients || !Array.isArray(recipients)) {
      return res.status(400).json({ 
        success: false, 
        error: '活動名稱、主題、內容和收件人列表為必填項目' 
      });
    }

    // 創建活動
    const campaignResult = await query(
      `INSERT INTO campaigns (user_id, template_id, name, subject, html_content, text_content, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft') RETURNING *`,
      [req.user.id, templateId, name, subject, htmlContent, textContent]
    );

    const campaign = campaignResult.rows[0];

    // 添加收件人
    for (const recipient of recipients) {
      await query(
        `INSERT INTO recipients (campaign_id, email, first_name, last_name, custom_fields)
         VALUES ($1, $2, $3, $4, $5)`,
        [campaign.id, recipient.email, recipient.firstName, recipient.lastName, JSON.stringify(recipient.customFields || {})]
      );
    }

    // 創建統計記錄
    await query(
      `INSERT INTO campaign_statistics (campaign_id) VALUES ($1)`,
      [campaign.id]
    );

    res.status(201).json({ success: true, campaign });
  } catch (error) {
    console.error('創建活動失敗:', error);
    res.status(500).json({ success: false, error: '創建活動失敗' });
  }
});

// 發送活動
router.post('/:id/send', async (req, res) => {
  try {
    // 獲取活動信息
    const campaignResult = await query(
      'SELECT * FROM campaigns WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: '活動不存在' });
    }

    const campaign = campaignResult.rows[0];

    if (campaign.status !== 'draft') {
      return res.status(400).json({ success: false, error: '活動已經發送或正在發送中' });
    }

    // 獲取收件人列表
    const recipientsResult = await query(
      'SELECT * FROM recipients WHERE campaign_id = $1 AND status = $2',
      [req.params.id, 'pending']
    );

    if (recipientsResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: '沒有待發送的收件人' });
    }

    // 更新活動狀態
    await query(
      'UPDATE campaigns SET status = $1, sent_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['sent', req.params.id]
    );

    // 準備郵件數據
    const emails = recipientsResult.rows.map(recipient => ({
      to: recipient.email,
      subject: campaign.subject,
      htmlContent: campaign.html_content,
      textContent: campaign.text_content,
      campaignId: campaign.id,
      userId: req.user.id,
      customArgs: {
        recipient_id: recipient.id,
        recipient_email: recipient.email
      }
    }));

    // 發送郵件
    const sendResult = await sendGridService.sendBatchEmails(emails);

    if (sendResult.success) {
      // 更新收件人狀態
      for (let i = 0; i < recipientsResult.rows.length; i++) {
        const recipient = recipientsResult.rows[i];
        const response = sendResult.responses[i];
        
        await query(
          `UPDATE recipients 
           SET status = $1, sendgrid_message_id = $2, sent_at = CURRENT_TIMESTAMP 
           WHERE id = $3`,
          ['sent', response.messageId, recipient.id]
        );
      }

      res.json({ 
        success: true, 
        message: '活動發送成功',
        sentCount: sendResult.sentCount
      });
    } else {
      // 發送失敗，更新活動狀態
      await query(
        'UPDATE campaigns SET status = $1 WHERE id = $2',
        ['failed', req.params.id]
      );

      res.status(500).json({ 
        success: false, 
        error: '活動發送失敗',
        details: sendResult.error
      });
    }
  } catch (error) {
    console.error('發送活動失敗:', error);
    res.status(500).json({ success: false, error: '發送活動失敗' });
  }
});

// 預覽郵件
router.post('/:id/preview', async (req, res) => {
  try {
    const { email } = req.body;
    
    const campaignResult = await query(
      'SELECT * FROM campaigns WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: '活動不存在' });
    }

    const campaign = campaignResult.rows[0];

    // 發送測試郵件
    const sendResult = await sendGridService.sendSingleEmail({
      to: email,
      subject: `[測試] ${campaign.subject}`,
      htmlContent: campaign.html_content,
      textContent: campaign.text_content,
      campaignId: campaign.id,
      userId: req.user.id,
      customArgs: { is_preview: true }
    });

    if (sendResult.success) {
      res.json({ success: true, message: '測試郵件發送成功' });
    } else {
      res.status(500).json({ 
        success: false, 
        error: '測試郵件發送失敗',
        details: sendResult.error
      });
    }
  } catch (error) {
    console.error('預覽郵件失敗:', error);
    res.status(500).json({ success: false, error: '預覽郵件失敗' });
  }
});

// 刪除活動
router.delete('/:id', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM campaigns WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: '活動不存在' });
    }

    res.json({ success: true, message: '活動已刪除' });
  } catch (error) {
    console.error('刪除活動失敗:', error);
    res.status(500).json({ success: false, error: '刪除活動失敗' });
  }
});

module.exports = router;
