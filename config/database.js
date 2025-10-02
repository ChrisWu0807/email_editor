const { Pool } = require('pg');
require('dotenv').config();

// 數據庫配置 - 支援本地開發和Zeabur雲端部署
const dbConfig = {
  // 本地開發配置
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'email_editor',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  
  // Zeabur部署時會自動設置DATABASE_URL
  ...(process.env.DATABASE_URL && {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  }),
  
  // 連接池配置
  max: 20, // 最大連接數
  idleTimeoutMillis: 30000, // 空閒連接超時
  connectionTimeoutMillis: 2000, // 連接超時
};

// 創建數據庫連接池
const pool = new Pool(dbConfig);

// 測試數據庫連接
pool.on('connect', () => {
  console.log('✅ 數據庫連接成功');
});

pool.on('error', (err) => {
  console.error('❌ 數據庫連接錯誤:', err);
});

// 數據庫查詢輔助函數
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('執行查詢:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('數據庫查詢錯誤:', error);
    throw error;
  }
};

// 獲取客戶端連接
const getClient = async () => {
  return await pool.connect();
};

// 初始化數據庫表
const initDatabase = async () => {
  try {
    // 讀取schema.sql文件並執行
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await query(schema);
    console.log('✅ 數據庫表初始化完成');
  } catch (error) {
    console.error('❌ 數據庫初始化失敗:', error);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  getClient,
  initDatabase
};
