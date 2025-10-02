const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const sendGridService = require('../services/sendgrid');
const { authenticateToken } = require('./auth');

// 所有路由都需要認證
router.use(authenticateToken);

// 獲取活動統計數據
router.get('/campaign/:id', async (req, res) => {
  try {
    const campaignId = req.params.id;

    // 驗證活動屬於當前用戶
    const campaignResult = await query(
      'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2',
      [campaignId, req.user.id]
    );

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: '活動不存在' });
    }

    // 獲取統計數據
    const statsResult = await query(
      `SELECT * FROM campaign_statistics WHERE campaign_id = $1`,
      [campaignId]
    );

    // 獲取收件人統計
    const recipientStatsResult = await query(
      `SELECT 
        status,
        COUNT(*) as count,
        COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened_count,
        COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked_count,
        COUNT(CASE WHEN unsubscribed_at IS NOT NULL THEN 1 END) as unsubscribed_count,
        COUNT(CASE WHEN bounced_at IS NOT NULL THEN 1 END) as bounced_count
       FROM recipients 
       WHERE campaign_id = $1 
       GROUP BY status`,
      [campaignId]
    );

    // 獲取詳細收件人列表
    const recipientsResult = await query(
      `SELECT 
        email,
        first_name,
        last_name,
        status,
        sent_at,
        delivered_at,
        opened_at,
        clicked_at,
        unsubscribed_at,
        bounced_at
       FROM recipients 
       WHERE campaign_id = $1 
       ORDER BY created_at DESC`,
      [campaignId]
    );

    // 計算總體統計
    const totalSent = recipientsResult.rows.length;
    const totalDelivered = recipientsResult.rows.filter(r => r.status === 'delivered' || r.status === 'sent').length;
    const totalOpened = recipientsResult.rows.filter(r => r.opened_at).length;
    const totalClicked = recipientsResult.rows.filter(r => r.clicked_at).length;
    const totalUnsubscribed = recipientsResult.rows.filter(r => r.unsubscribed_at).length;
    const totalBounced = recipientsResult.rows.filter(r => r.bounced_at).length;

    const statistics = {
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalUnsubscribed,
      totalBounced,
      deliveryRate: totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(2) : 0,
      openRate: totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(2) : 0,
      clickRate: totalDelivered > 0 ? ((totalClicked / totalDelivered) * 100).toFixed(2) : 0,
      unsubscribeRate: totalDelivered > 0 ? ((totalUnsubscribed / totalDelivered) * 100).toFixed(2) : 0,
      bounceRate: totalSent > 0 ? ((totalBounced / totalSent) * 100).toFixed(2) : 0
    };

    // 更新數據庫中的統計數據
    if (statsResult.rows.length > 0) {
      await query(
        `UPDATE campaign_statistics 
         SET total_sent = $1, total_delivered = $2, total_opened = $3, 
             total_clicked = $4, total_unsubscribed = $5, total_bounced = $6,
             delivery_rate = $7, open_rate = $8, click_rate = $9, 
             unsubscribe_rate = $10, bounce_rate = $11, last_updated = CURRENT_TIMESTAMP
         WHERE campaign_id = $12`,
        [
          totalSent, totalDelivered, totalOpened, totalClicked, 
          totalUnsubscribed, totalBounced, statistics.deliveryRate,
          statistics.openRate, statistics.clickRate, statistics.unsubscribeRate,
          statistics.bounceRate, campaignId
        ]
      );
    } else {
      await query(
        `INSERT INTO campaign_statistics 
         (campaign_id, total_sent, total_delivered, total_opened, total_clicked, 
          total_unsubscribed, total_bounced, delivery_rate, open_rate, click_rate, 
          unsubscribe_rate, bounce_rate)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          campaignId, totalSent, totalDelivered, totalOpened, totalClicked,
          totalUnsubscribed, totalBounced, statistics.deliveryRate,
          statistics.openRate, statistics.clickRate, statistics.unsubscribeRate,
          statistics.bounceRate
        ]
      );
    }

    res.json({
      success: true,
      statistics,
      recipients: recipientsResult.rows,
      statusBreakdown: recipientStatsResult.rows
    });
  } catch (error) {
    console.error('獲取統計數據失敗:', error);
    res.status(500).json({ success: false, error: '獲取統計數據失敗' });
  }
});

// 獲取用戶所有活動的總體統計
router.get('/overview', async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        COUNT(*) as total_campaigns,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_campaigns,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_campaigns,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_campaigns
       FROM campaigns 
       WHERE user_id = $1`,
      [req.user.id]
    );

    const recipientStatsResult = await query(
      `SELECT 
        COUNT(*) as total_recipients,
        COUNT(CASE WHEN status = 'sent' OR status = 'delivered' THEN 1 END) as sent_recipients,
        COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened_recipients,
        COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked_recipients,
        COUNT(CASE WHEN unsubscribed_at IS NOT NULL THEN 1 END) as unsubscribed_recipients,
        COUNT(CASE WHEN bounced_at IS NOT NULL THEN 1 END) as bounced_recipients
       FROM recipients r
       JOIN campaigns c ON r.campaign_id = c.id
       WHERE c.user_id = $1`,
      [req.user.id]
    );

    const campaignStats = result.rows[0];
    const recipientStats = recipientStatsResult.rows[0];

    const overview = {
      campaigns: campaignStats,
      recipients: recipientStats,
      overallStats: {
        deliveryRate: recipientStats.total_recipients > 0 ? 
          ((recipientStats.sent_recipients / recipientStats.total_recipients) * 100).toFixed(2) : 0,
        openRate: recipientStats.sent_recipients > 0 ? 
          ((recipientStats.opened_recipients / recipientStats.sent_recipients) * 100).toFixed(2) : 0,
        clickRate: recipientStats.sent_recipients > 0 ? 
          ((recipientStats.clicked_recipients / recipientStats.sent_recipients) * 100).toFixed(2) : 0,
        unsubscribeRate: recipientStats.sent_recipients > 0 ? 
          ((recipientStats.unsubscribed_recipients / recipientStats.sent_recipients) * 100).toFixed(2) : 0,
        bounceRate: recipientStats.total_recipients > 0 ? 
          ((recipientStats.bounced_recipients / recipientStats.total_recipients) * 100).toFixed(2) : 0
      }
    };

    res.json({ success: true, overview });
  } catch (error) {
    console.error('獲取總體統計失敗:', error);
    res.status(500).json({ success: false, error: '獲取總體統計失敗' });
  }
});

// 獲取時間範圍內的統計數據
router.get('/timeframe', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        error: '開始日期和結束日期為必填項目' 
      });
    }

    const result = await query(
      `SELECT 
        DATE(c.sent_at) as date,
        COUNT(*) as campaigns_count,
        COUNT(r.id) as recipients_count,
        COUNT(CASE WHEN r.status = 'sent' OR r.status = 'delivered' THEN 1 END) as sent_count,
        COUNT(CASE WHEN r.opened_at IS NOT NULL THEN 1 END) as opened_count,
        COUNT(CASE WHEN r.clicked_at IS NOT NULL THEN 1 END) as clicked_count
       FROM campaigns c
       LEFT JOIN recipients r ON c.id = r.campaign_id
       WHERE c.user_id = $1 
         AND c.sent_at >= $2 
         AND c.sent_at <= $3
       GROUP BY DATE(c.sent_at)
       ORDER BY date`,
      [req.user.id, startDate, endDate]
    );

    res.json({ success: true, timeSeriesData: result.rows });
  } catch (error) {
    console.error('獲取時間序列數據失敗:', error);
    res.status(500).json({ success: false, error: '獲取時間序列數據失敗' });
  }
});

// 同步SendGrid統計數據
router.post('/sync/:campaignId', async (req, res) => {
  try {
    const campaignId = req.params.campaignId;

    // 驗證活動屬於當前用戶
    const campaignResult = await query(
      'SELECT sendgrid_message_id FROM campaigns WHERE id = $1 AND user_id = $2',
      [campaignId, req.user.id]
    );

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: '活動不存在' });
    }

    // 這裡可以實現從SendGrid API同步最新統計數據的邏輯
    // 由於SendGrid的統計API比較複雜，這裡提供基本框架

    res.json({ 
      success: true, 
      message: '統計數據同步功能開發中' 
    });
  } catch (error) {
    console.error('同步統計數據失敗:', error);
    res.status(500).json({ success: false, error: '同步統計數據失敗' });
  }
});

module.exports = router;
