const express = require('express');
const User = require('../models/user');
const { verifyToken, checkRole } = require('../middleware/auth');
const router = express.Router();

// 获取个人资料
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新个人资料
router.put('/update', verifyToken, async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await User.findByPk(req.user.id);
    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();
    res.status(200).json({ success: true, message: 'Profile updated successfully.', user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 管理员：获取所有用户
router.get('/all', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
    });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 管理员：修改用户权限
router.put('/role/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  const { role } = req.body;

  try {
    const user = await User.findByPk(req.params.id);
    user.role = role;
    await user.save();
    res.status(200).json({ success: true, message: 'Role updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 管理员：修改会员号
router.put('/membership/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  const { membership_id } = req.body;

  try {
    const user = await User.findByPk(req.params.id);
    user.membership_id = membership_id;
    await user.save();
    res.status(200).json({ success: true, message: 'Membership ID updated.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;