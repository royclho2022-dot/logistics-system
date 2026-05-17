const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/payment');
const User = require('../models/user');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// 发起充值请求
router.post('/recharge', verifyToken, async (req, res) => {
  const { amount } = req.body;

  try {
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Account Recharge',
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.DOMAIN}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN}/payments/cancel`,
    });

    const payment = await Payment.create({
      user_id: req.user.id,
      amount,
      status: 'pending',
      stripe_session_id: session.id,
    });

    res.status(200).json({
      success: true,
      url: session.url,
      payment_id: payment.id,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 验证支付完成
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const payload = req.body;
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const payment = await Payment.findOne({ where: { stripe_session_id: session.id } });
      
      if (payment) {
        payment.status = 'completed';
        await payment.save();

        const user = await User.findByPk(payment.user_id);
        user.balance = parseFloat(user.balance) + parseFloat(payment.amount);
        await user.save();
      }
    }

    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook error: ${err.message}`);
  }
});

// 查询支付历史
router.get('/history', verifyToken, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
    });
    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;