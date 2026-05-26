// routes/flightRoutes.js
const express = require('express');
const router  = express.Router();
const jwt = require('jsonwebtoken');
const { requireAdmin } = require('../middleware/adminMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'tictacvoyage_secret';

const requireClient = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token manquant' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.clientId = decoded.id;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
  }
};

const {
  searchFlights,
  getOffer,
  bookFlight,
  getReservations,
  getMyReservations,
  updateReservationStatus,
  setPriceOverride,
  deletePriceOverride,
  getPriceOverrides,
} = require('../controllers/flightController');

// ── Public routes ─────────────────────────────────────────────
router.post('/search',        searchFlights);
router.get('/offer/:offerId', getOffer);

// ── User booking ──────────────────────────────────────────────
router.post('/book', requireClient, bookFlight);
router.get('/mine', requireClient, getMyReservations);

// ── Admin — reservations ──────────────────────────────────────
router.get('/reservations',              requireAdmin, getReservations);
router.patch('/reservations/:id/status', requireAdmin, updateReservationStatus);


module.exports = router;
