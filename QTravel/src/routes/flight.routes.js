const { Router } = require('express');
const FlightController = require('../controllers/flight.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = Router();

// 1. PLACES & AIRPORTS
router.get('/airports', FlightController.listAirports);
router.get('/places/suggestions', FlightController.searchPlaces);

// 2. FLIGHT SEARCH
router.post('/offer_requests', FlightController.createOfferRequest);
router.get('/offers', FlightController.listOffers);
router.get('/offers/:id', FlightController.getOffer);
router.get('/seat_maps', FlightController.getSeatMaps);

// 3. BOOKING
router.post('/orders', authMiddleware, FlightController.createOrder);
router.get('/orders', FlightController.listOrders);
router.get('/orders/:id', FlightController.getOrder);

// 4. REFERENCE DATA
router.get('/airlines', FlightController.listAirlines);
router.get('/aircraft', FlightController.listAircrafts);

// 5. PAYMENTS
router.post('/payments', FlightController.payForOrder);
router.post('/payments/sessions', FlightController.createPaymentSession);

module.exports = router;
