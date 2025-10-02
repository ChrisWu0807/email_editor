const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// 配置SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class SendGridService {
  constructor() {
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL;
    this.fromName = process.env.SENDGRID_FROM_NAME;
  }

  /**
   * 發送單封郵件
   * @param {Object} emailData - 郵件數據
   * @param {string} emailData.to - 收件人郵箱
   * @param {string} emailData.subject - 郵件主題
   * @param {string} emailData.htmlContent - HTML內容
   * @param {string} emailData.textContent - 純文本內容
   * @param {Object} emailData.customArgs - 自定義參數
   */
  async sendSingleEmail(emailData) {
    try {
      const msg = {
        to: emailData.to,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: emailData.subject,
        html: emailData.htmlContent,
        text: emailData.textContent || emailData.htmlContent.replace(/<[^>]*>/g, ''),
        customArgs: {
          campaign_id: emailData.campaignId || '',
          user_id: emailData.userId || '',
          ...emailData.customArgs
        }
      };

      const response = await sgMail.send(msg);
      console.log('✅ 郵件發送成功:', response[0].statusCode);
      return {
        success: true,
        messageId: response[0].headers['x-message-id'],
        statusCode: response[0].statusCode
      };
    } catch (error) {
      console.error('❌ 郵件發送失敗:', error);
      return {
        success: false,
        error: error.message,
        details: error.response?.body
      };
    }
  }

  /**
   * 批量發送郵件
   * @param {Array} emails - 郵件列表
   */
  async sendBatchEmails(emails) {
    try {
      const messages = emails.map(email => ({
        to: email.to,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: email.subject,
        html: email.htmlContent,
        text: email.textContent || email.htmlContent.replace(/<[^>]*>/g, ''),
        customArgs: {
          campaign_id: email.campaignId || '',
          user_id: email.userId || '',
          recipient_email: email.to,
          ...email.customArgs
        }
      }));

      const response = await sgMail.send(messages);
      console.log(`✅ 批量郵件發送成功: ${response.length} 封`);
      return {
        success: true,
        sentCount: response.length,
        responses: response.map(r => ({
          statusCode: r.statusCode,
          messageId: r.headers['x-message-id']
        }))
      };
    } catch (error) {
      console.error('❌ 批量郵件發送失敗:', error);
      return {
        success: false,
        error: error.message,
        details: error.response?.body
      };
    }
  }

  /**
   * 獲取郵件統計數據
   * @param {string} campaignId - 活動ID
   */
  async getCampaignStats(campaignId) {
    try {
      const sg = require('@sendgrid/client');
      sg.setApiKey(process.env.SENDGRID_API_KEY);

      // 設置請求
      const request = {
        method: 'GET',
        url: '/v3/stats',
        qs: {
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
          aggregated_by: 'day'
        }
      };

      const [response] = await sg.request(request);
      return {
        success: true,
        stats: response.body
      };
    } catch (error) {
      console.error('❌ 獲取統計數據失敗:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 獲取特定郵件的活動數據
   * @param {string} messageId - SendGrid消息ID
   */
  async getMessageActivity(messageId) {
    try {
      const sg = require('@sendgrid/client');
      sg.setApiKey(process.env.SENDGRID_API_KEY);

      const request = {
        method: 'GET',
        url: `/v3/messages/${messageId}`
      };

      const [response] = await sg.request(request);
      return {
        success: true,
        activity: response.body
      };
    } catch (error) {
      console.error('❌ 獲取郵件活動失敗:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 驗證API密鑰
   */
  async validateApiKey() {
    try {
      const sg = require('@sendgrid/client');
      sg.setApiKey(process.env.SENDGRID_API_KEY);

      const request = {
        method: 'GET',
        url: '/v3/user/account'
      };

      const [response] = await sg.request(request);
      return {
        success: true,
        account: response.body
      };
    } catch (error) {
      console.error('❌ SendGrid API密鑰驗證失敗:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new SendGridService();
