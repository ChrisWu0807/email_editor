const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('./auth');

// Webhook端點不需要認證，但查詢端點需要
router.use('/events', authenticateToken);
router.use('/events/:id/retry', authenticateToken);

// SendGrid Webhook處理
router.post('/sendgrid', async (req, res) => {
  try {
    const events = req.body;

    if (!Array.isArray(events)) {
      return res.status(400).json({ success: false, error: '無效的webhook數據格式' });
    }

    for (const event of events) {
      await processSendGridEvent(event);
    }

    res.status(200).json({ success: true, message: 'Webhook處理完成' });
  } catch (error) {
    console.error('處理SendGrid webhook失敗:', error);
    res.status(500).json({ success: false, error: '處理webhook失敗' });
  }
});

// 處理單個SendGrid事件
async function processSendGridEvent(event) {
  try {
    const { 
      event: eventType, 
      email, 
      sg_message_id, 
      timestamp,
      campaign_id,
      recipient_id
    } = event;

    // 查找對應的收件人記錄
    let recipientQuery;
    let queryParams;

    if (recipient_id) {
      recipientQuery = 'SELECT * FROM recipients WHERE id = $1';
      queryParams = [recipient_id];
    } else if (campaign_id && email) {
      recipientQuery = 'SELECT * FROM recipients WHERE campaign_id = $1 AND email = $2';
      queryParams = [campaign_id, email];
    } else {
      console.log('無法找到對應的收件人記錄:', event);
      return;
    }

    const recipientResult = await query(recipientQuery, queryParams);

    if (recipientResult.rows.length === 0) {
      console.log('收件人記錄不存在:', event);
      return;
    }

    const recipient = recipientResult.rows[0];

    // 根據事件類型更新收件人狀態
    switch (eventType) {
      case 'delivered':
        await query(
          `UPDATE recipients 
           SET status = 'delivered', delivered_at = $1 
           WHERE id = $2`,
          [new Date(timestamp * 1000), recipient.id]
        );
        break;

      case 'open':
        await query(
          `UPDATE recipients 
           SET opened_at = $1 
           WHERE id = $2 AND opened_at IS NULL`,
          [new Date(timestamp * 1000), recipient.id]
        );
        break;

      case 'click':
        await query(
          `UPDATE recipients 
           SET clicked_at = $1 
           WHERE id = $2 AND clicked_at IS NULL`,
          [new Date(timestamp * 1000), recipient.id]
        );
        break;

      case 'bounce':
        await query(
          `UPDATE recipients 
           SET status = 'bounced', bounced_at = $1 
           WHERE id = $2`,
          [new Date(timestamp * 1000), recipient.id]
        );
        break;

      case 'unsubscribe':
        await query(
          `UPDATE recipients 
           SET status = 'unsubscribed', unsubscribed_at = $1 
           WHERE id = $2`,
          [new Date(timestamp * 1000), recipient.id]
        );
        break;

      case 'spam_report':
        await query(
          `UPDATE recipients 
           SET status = 'spam' 
           WHERE id = $1`,
          [recipient.id]
        );
        break;

      default:
        console.log('未處理的事件類型:', eventType);
    }

    // 記錄事件到事件表
    await query(
      `INSERT INTO sendgrid_events 
       (campaign_id, recipient_email, event_type, sendgrid_message_id, event_data, processed)
       VALUES ($1, $2, $3, $4, $5, true)`,
      [
        recipient.campaign_id,
        recipient.email,
        eventType,
        sg_message_id,
        JSON.stringify(event)
      ]
    );

    console.log(`✅ 處理事件成功: ${eventType} - ${email}`);
  } catch (error) {
    console.error('處理SendGrid事件失敗:', error);
    
    // 記錄未處理的事件
    try {
      await query(
        `INSERT INTO sendgrid_events 
         (campaign_id, recipient_email, event_type, sendgrid_message_id, event_data, processed)
         VALUES ($1, $2, $3, $4, $5, false)`,
        [
          event.campaign_id || null,
          event.email || '',
          event.event || 'unknown',
          event.sg_message_id || '',
          JSON.stringify(event)
        ]
      );
    } catch (insertError) {
      console.error('記錄未處理事件失敗:', insertError);
    }
  }
}

// 獲取webhook事件列表
router.get('/events', async (req, res) => {
  try {
    const { campaignId, eventType, processed } = req.query;
    
    let queryText = `
      SELECT * FROM sendgrid_events 
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 0;

    if (campaignId) {
      paramCount++;
      queryText += ` AND campaign_id = $${paramCount}`;
      queryParams.push(campaignId);
    }

    if (eventType) {
      paramCount++;
      queryText += ` AND event_type = $${paramCount}`;
      queryParams.push(eventType);
    }

    if (processed !== undefined) {
      paramCount++;
      queryText += ` AND processed = $${paramCount}`;
      queryParams.push(processed === 'true');
    }

    queryText += ` ORDER BY created_at DESC LIMIT 100`;

    const result = await query(queryText, queryParams);
    res.json({ success: true, events: result.rows });
  } catch (error) {
    console.error('獲取webhook事件失敗:', error);
    res.status(500).json({ success: false, error: '獲取webhook事件失敗' });
  }
});

// 重新處理失敗的事件
router.post('/events/:id/retry', async (req, res) => {
  try {
    const eventId = req.params.id;

    const eventResult = await query(
      'SELECT * FROM sendgrid_events WHERE id = $1 AND processed = false',
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: '事件不存在或已處理' });
    }

    const event = eventResult.rows[0];
    const eventData = JSON.parse(event.event_data);

    await processSendGridEvent(eventData);

    res.json({ success: true, message: '事件重新處理完成' });
  } catch (error) {
    console.error('重新處理事件失敗:', error);
    res.status(500).json({ success: false, error: '重新處理事件失敗' });
  }
});

module.exports = router;
