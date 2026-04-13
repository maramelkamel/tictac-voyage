// routes/hotelRoutes.js
const express = require('express');
const router  = express.Router();

const {
  searchHotels,
  getHotelDetails,
  bookHotel,
  getReservations,
  updateReservationStatus,
  setPriceOverride,
  deletePriceOverride,
  getPriceOverrides,
  getDestinations,
} = require('../controllers/hotelController');

// ── Public ────────────────────────────────────────────────────
router.post('/search',              searchHotels);
router.get('/details/:hotelCode',   getHotelDetails);
router.get('/destinations',         getDestinations);

// ── User booking ──────────────────────────────────────────────
router.post('/book', bookHotel);

// ── Admin — reservations ──────────────────────────────────────
router.get('/reservations',              getReservations);
router.patch('/reservations/:id/status', updateReservationStatus);

// ── Admin — price overrides ───────────────────────────────────
router.post('/price-override',             setPriceOverride);
router.delete('/price-override/:hotelCode', deletePriceOverride);
router.get('/price-overrides',             getPriceOverrides);

module.exports = router;