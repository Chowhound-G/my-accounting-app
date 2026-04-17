const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// 从环境变量读取数据库配置（Docker 最佳实践）
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mydatabase',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || '123456',
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// 获取交易列表（带窗口函数示例）
app.get('/api/transactions', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        account_id,
        amount,
        category,
        trans_date,
        SUM(amount) OVER (
          PARTITION BY account_id 
          ORDER BY trans_date 
          ROWS UNBOUNDED PRECEDING
        ) as running_balance
      FROM transactions 
      ORDER BY trans_date DESC 
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 创建交易
app.post('/api/transactions', async (req, res) => {
  const { account_id, amount, category, trans_date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO transactions (account_id, amount, category, trans_date) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [account_id, amount, category, trans_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});