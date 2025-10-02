const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { initDatabase } = require('./config/database');

// 路由引入
const authRoutes = require('./routes/auth');
const templateRoutes = require('./routes/templates');
const campaignRoutes = require('./routes/campaigns');
const statisticsRoutes = require('./routes/statistics');
const webhookRoutes = require('./routes/webhooks');

const app = express();
const PORT = process.env.PORT || 8080;

// 信任代理（用於雲端環境）
app.set('trust proxy', 1);

// 安全中間件
app.use(helmet());

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 100, // 限制每個IP每15分鐘最多100個請求
  message: '請求過於頻繁，請稍後再試'
});
app.use('/api/', limiter);

// CORS配置 - 支援本地開發和生產環境
const corsOptions = {
  origin: function (origin, callback) {
    // 允許本地開發和生產環境的請求
    const allowedOrigins = [
      'http://localhost:3000',
      'https://your-zeabur-app.zeabur.app',
      process.env.CLIENT_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('不允許的CORS來源'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));

// 解析JSON請求
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/webhooks', webhookRoutes);

// 健康檢查端點 - Zeabur需要
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API 信息路由（僅在開發環境或特定路徑）
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Email Editor API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      templates: '/api/templates',
      campaigns: '/api/campaigns',
      statistics: '/api/statistics',
      webhooks: '/api/webhooks'
    }
  });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('服務器錯誤:', err);
  res.status(500).json({
    error: '內部服務器錯誤',
    message: process.env.NODE_ENV === 'development' ? err.message : '請稍後再試'
  });
});

// 提供前端靜態文件（生產環境）
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const clientBuildPath = path.join(__dirname, 'client', 'build');
  
  // 檢查 build 目錄是否存在
  const fs = require('fs');
  if (fs.existsSync(clientBuildPath)) {
    // 提供靜態文件
    app.use(express.static(clientBuildPath));
    
    // 所有非 API 路由都返回 index.html
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  } else {
    // 如果沒有 build 目錄，返回 API 信息
    app.use('*', (req, res) => {
      res.status(404).json({ error: '路由不存在' });
    });
  }
} else {
  // 開發環境 - 404處理
  app.use('*', (req, res) => {
    res.status(404).json({ error: '路由不存在' });
  });
}

// 啟動服務器
const startServer = async () => {
  try {
    // 初始化數據庫
    await initDatabase();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 服務器運行在端口 ${PORT}`);
      console.log(`📧 Email Editor API 已啟動`);
      console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`);
      
      if (process.env.NODE_ENV === 'production') {
        console.log(`☁️ 運行在雲端環境 (Zeabur)`);
      }
    });
  } catch (error) {
    console.error('❌ 服務器啟動失敗:', error);
    process.exit(1);
  }
};

startServer();
