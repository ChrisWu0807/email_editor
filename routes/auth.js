const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { query } = require('../config/database');

// 註冊
router.post('/register', async (req, res) => {
  try {
    console.log('🔍 [AuthAPI] /register 端點被調用');
    console.log('🔍 [AuthAPI] 請求數據:', req.body);
    
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      console.log('🔍 [AuthAPI] 缺少必填字段');
      return res.status(400).json({
        success: false,
        error: '用戶名、郵箱和密碼為必填項目'
      });
    }

    console.log('🔍 [AuthAPI] 檢查用戶是否已存在');
    // 檢查用戶是否已存在
    const existingUser = await query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    console.log('🔍 [AuthAPI] 現有用戶查詢結果:', existingUser.rows);

    if (existingUser.rows.length > 0) {
      console.log('🔍 [AuthAPI] 用戶已存在');
      return res.status(400).json({
        success: false,
        error: '用戶名或郵箱已存在'
      });
    }

    // 加密密碼
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 創建用戶
    const result = await query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, passwordHash]
    );

    const user = result.rows[0];

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: '註冊成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('註冊失敗:', error);
    res.status(500).json({
      success: false,
      error: '註冊失敗'
    });
  }
});

// 登入
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: '用戶名和密碼為必填項目'
      });
    }

    // 查找用戶
    const result = await query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: '用戶名或密碼錯誤'
      });
    }

    const user = result.rows[0];

    // 驗證密碼
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: '用戶名或密碼錯誤'
      });
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: '登入成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('登入失敗:', error);
    res.status(500).json({
      success: false,
      error: '登入失敗'
    });
  }
});

// 驗證token中間件
const authenticateToken = (req, res, next) => {
  console.log('🔍 [AuthMiddleware] 開始認證檢查');
  const authHeader = req.headers['authorization'];
  console.log('🔍 [AuthMiddleware] Authorization 頭:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1];
  console.log('🔍 [AuthMiddleware] 提取的 token:', token ? '存在' : '不存在');

  if (!token) {
    console.log('🔍 [AuthMiddleware] 沒有 token，返回 401');
    return res.status(401).json({
      success: false,
      error: '需要認證token'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('🔍 [AuthMiddleware] Token 驗證失敗:', err.message);
      return res.status(403).json({
        success: false,
        error: '無效的token'
      });
    }

    console.log('🔍 [AuthMiddleware] Token 驗證成功，用戶:', user);
    req.user = user;
    next();
  });
};

// 獲取當前用戶信息
router.get('/me', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 [AuthAPI] /me 端點被調用');
    console.log('🔍 [AuthAPI] 請求用戶 ID:', req.user.userId);
    console.log('🔍 [AuthAPI] 請求頭 Authorization:', req.headers.authorization);
    
    const result = await query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    console.log('🔍 [AuthAPI] 數據庫查詢結果:', result.rows);

    if (result.rows.length === 0) {
      console.log('🔍 [AuthAPI] 用戶不存在');
      return res.status(404).json({
        success: false,
        error: '用戶不存在'
      });
    }

    const userData = result.rows[0];
    console.log('🔍 [AuthAPI] 返回用戶數據:', userData);
    
    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('🔍 [AuthAPI] 獲取用戶信息失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取用戶信息失敗'
    });
  }
});

// 更新用戶信息
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { username, email } = req.body;

    // 檢查用戶名或郵箱是否已被其他用戶使用
    const existingUser = await query(
      'SELECT id FROM users WHERE (username = $1 OR email = $2) AND id != $3',
      [username, email, req.user.userId]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: '用戶名或郵箱已被其他用戶使用'
      });
    }

    const result = await query(
      'UPDATE users SET username = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, username, email, created_at, updated_at',
      [username, email, req.user.userId]
    );

    res.json({
      success: true,
      message: '用戶信息更新成功',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('更新用戶信息失敗:', error);
    res.status(500).json({
      success: false,
      error: '更新用戶信息失敗'
    });
  }
});

// 修改密碼
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: '當前密碼和新密碼為必填項目'
      });
    }

    // 獲取用戶當前密碼
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '用戶不存在'
      });
    }

    // 驗證當前密碼
    const isValidPassword = await bcrypt.compare(currentPassword, result.rows[0].password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: '當前密碼錯誤'
      });
    }

    // 加密新密碼
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // 更新密碼
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, req.user.userId]
    );

    res.json({
      success: true,
      message: '密碼修改成功'
    });
  } catch (error) {
    console.error('修改密碼失敗:', error);
    res.status(500).json({
      success: false,
      error: '修改密碼失敗'
    });
  }
});

// 導出認證中間件供其他路由使用
module.exports = router;
module.exports.authenticateToken = authenticateToken;
