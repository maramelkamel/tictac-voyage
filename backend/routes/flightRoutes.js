// routes/flightRoutes.js
const express = require('express');
const router  = express.Router();

const {
  searchFlights,
  getOffer,
  bookFlight,
  getReservations,
  updateReservationStatus,
  setPriceOverride,
  deletePriceOverride,
  getPriceOverrides,
} = require('../controllers/flightController');

// ── Public routes ─────────────────────────────────────────────
router.post('/search',        searchFlights);
router.get('/offer/:offerId', getOffer);

// ── User booking ──────────────────────────────────────────────
router.post('/book', bookFlight);

// ── Admin — reservations ──────────────────────────────────────
router.get('/reservations',              getReservations);
router.patch('/reservations/:id/status', updateReservationStatus);

// ── Admin — price overrides ───────────────────────────────────
router.post('/price-override',            setPriceOverride);
router.delete('/price-override/:offerId', deletePriceOverride);
router.get('/price-overrides',            getPriceOverrides);

module.exports = router;