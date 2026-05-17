const express = require('express');
const cors = require('cors');
const sequelize = require('./database');
require('dotenv').config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/users', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 初始化数据库
(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database connected and synced.');
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database error:', error);
  }
})();

module.exports = app;