const { Router } = require('express');
const UserController = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = Router();

router.use(authMiddleware);

router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.put('/change-password', UserController.changePassword);
router.get('/orders', UserController.getOrders);
router.get('/hotel-orders', UserController.getHotelOrders);
router.get('/hotel-orders/:id', UserController.getHotelOrder);
router.get('/orders/:id', UserController.getOrder);

module.exports = router;
