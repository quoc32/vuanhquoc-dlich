const { Router } = require('express');
const HotelController = require('../controllers/hotel.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = Router();

router.get('/cities/search', HotelController.searchCities);
router.get('/', HotelController.searchHotels);
router.get('/:id', HotelController.getHotelDetails);
router.get('/:id/reviews', HotelController.getReviews);
router.post('/:id/reviews', authMiddleware, upload.array('images', 5), HotelController.addReview);
router.put('/:id/reviews/:reviewId', authMiddleware, HotelController.updateReview);
router.delete('/:id/reviews/:reviewId', authMiddleware, HotelController.deleteReview);

module.exports = router;
