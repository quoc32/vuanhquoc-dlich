const { Router } = require('express');
const AuthController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', authMiddleware, AuthController.logout);

module.exports = router;
