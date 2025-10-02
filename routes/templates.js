const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('./auth');

// 所有路由都需要認證
router.use(authenticateToken);

// 獲取所有模板
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM email_templates WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, templates: result.rows });
  } catch (error) {
    console.error('獲取模板失敗:', error);
    res.status(500).json({ success: false, error: '獲取模板失敗' });
  }
});

// 獲取單個模板
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM email_templates WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: '模板不存在' });
    }
    
    res.json({ success: true, template: result.rows[0] });
  } catch (error) {
    console.error('獲取模板失敗:', error);
    res.status(500).json({ success: false, error: '獲取模板失敗' });
  }
});

// 創建新模板
router.post('/', async (req, res) => {
  try {
    const { name, subject, htmlContent, textContent } = req.body;
    
    if (!name || !htmlContent) {
      return res.status(400).json({ 
        success: false, 
        error: '模板名稱和HTML內容為必填項目' 
      });
    }

    const result = await query(
      `INSERT INTO email_templates (user_id, name, subject, html_content, text_content)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, name, subject, htmlContent, textContent]
    );

    res.status(201).json({ success: true, template: result.rows[0] });
  } catch (error) {
    console.error('創建模板失敗:', error);
    res.status(500).json({ success: false, error: '創建模板失敗' });
  }
});

// 更新模板
router.put('/:id', async (req, res) => {
  try {
    const { name, subject, htmlContent, textContent, isActive } = req.body;
    
    const result = await query(
      `UPDATE email_templates 
       SET name = $1, subject = $2, html_content = $3, text_content = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [name, subject, htmlContent, textContent, isActive, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: '模板不存在' });
    }

    res.json({ success: true, template: result.rows[0] });
  } catch (error) {
    console.error('更新模板失敗:', error);
    res.status(500).json({ success: false, error: '更新模板失敗' });
  }
});

// 刪除模板
router.delete('/:id', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM email_templates WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: '模板不存在' });
    }

    res.json({ success: true, message: '模板已刪除' });
  } catch (error) {
    console.error('刪除模板失敗:', error);
    res.status(500).json({ success: false, error: '刪除模板失敗' });
  }
});

// 複製模板
router.post('/:id/duplicate', async (req, res) => {
  try {
    const { name } = req.body;
    
    // 獲取原模板
    const originalResult = await query(
      'SELECT * FROM email_templates WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (originalResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: '原模板不存在' });
    }

    const original = originalResult.rows[0];
    const newName = name || `${original.name} (副本)`;

    // 創建新模板
    const result = await query(
      `INSERT INTO email_templates (user_id, name, subject, html_content, text_content)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, newName, original.subject, original.html_content, original.text_content]
    );

    res.status(201).json({ success: true, template: result.rows[0] });
  } catch (error) {
    console.error('複製模板失敗:', error);
    res.status(500).json({ success: false, error: '複製模板失敗' });
  }
});

module.exports = router;
