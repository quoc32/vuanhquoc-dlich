const { Router } = require('express');
const MomoController = require('../controllers/momo.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = Router();

// Endpoint tạo link thanh toán (cần đăng nhập)
router.post('/create', authMiddleware, MomoController.createPayment);

// Webhook IPN từ MoMo
router.post('/ipn', MomoController.ipnCallback);

module.exports = router;
