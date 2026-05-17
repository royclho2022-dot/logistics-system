const express = require('express');
const { verifyToken, checkRole } = require('../middleware/auth');
const User = require('../models/user');
const Order = require('../models/order');
const Payment = require('../models/payment');
const sequelize = require('sequelize');
const router = express.Router();

// 获取仪表板数据
router.get('/dashboard', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalOrders = await Order.count();
    const totalRevenue = await Payment.sum('amount', { where: { status: 'completed' } });
    const totalMembers = await User.count({ where: { role: 'member' } });

    res.status(200).json({
      success: true,
      dashboard: {
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue || 0,
        totalMembers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取订单统计
router.get('/order-stats', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const stats = await Order.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true,
    });
    res.status(200).json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;