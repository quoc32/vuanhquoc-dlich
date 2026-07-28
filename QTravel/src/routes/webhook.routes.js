const express = require('express');
const router = express.Router();
const WebhookController = require('../controllers/webhook.controller');

router.post('/hotel-order', WebhookController.handleHotelOrder);

module.exports = router;
