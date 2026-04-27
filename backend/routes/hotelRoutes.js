// backend/routes/hotelRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/hotelController');
const { requireAdmin } = require('../middleware/adminMiddleware');

// Public list
router.get('/', ctrl.getAll);

// Reservations (public create + admin list)
router.route('/reservations')
  .post(ctrl.createReservation)
  .get(requireAdmin, ctrl.getReservations);

// Admin reservations
router.patch('/reservations/:id/status', requireAdmin, ctrl.updateReservationStatus);

// Admin CRUD
router.post('/admin', requireAdmin, ctrl.create);
router.put('/admin/:id', requireAdmin, ctrl.update);
router.delete('/admin/:id', requireAdmin, ctrl.remove);

// Admin pricing (existing admin page)
router.post('/search', requireAdmin, ctrl.search);
router.post('/price-override', requireAdmin, ctrl.setPriceOverride);
router.delete('/price-override/:hotelCode', requireAdmin, ctrl.deletePriceOverride);
router.get('/price-overrides', requireAdmin, ctrl.getPriceOverrides);

// Public details (keep last to avoid shadowing other routes)
router.get('/:id', ctrl.getOne);

module.exports = router;
