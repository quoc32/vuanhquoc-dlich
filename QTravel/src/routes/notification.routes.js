const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notification.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', NotificationController.getNotifications);
router.put('/read', NotificationController.markAsRead);

module.exports = router;
