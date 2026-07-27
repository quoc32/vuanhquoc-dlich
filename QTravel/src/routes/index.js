const { Router } = require('express');
const flightRoutes = require('./flight.routes');
const authRoutes = require('./auth.routes');
const momoRoutes = require('./momo.routes');
const userRoutes = require('./user.routes');
const hotelRoutes = require('./hotel.routes');

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running successfully' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/flights', flightRoutes);
router.use('/momo', momoRoutes);
router.use('/hotels', hotelRoutes);

module.exports = router;
