// backend/routes/omraReservationRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/omraReservationController');

// GET /api/omra/reservations/stats  ← must be BEFORE /:id
router.get('/stats', ctrl.getStats);

// GET  /api/omra/reservations       → all reservations (filters: status, payment_method, search)
// POST /api/omra/reservations       → create reservation (client form submit)
router.route('/')
  .get(ctrl.getAll)
  .post(ctrl.create);

// GET    /api/omra/reservations/:id         → one reservation
// DELETE /api/omra/reservations/:id         → delete
router.route('/:id')
  .get(ctrl.getOne)
  .delete(ctrl.remove);

// PATCH  /api/omra/reservations/:id/status  → update status (admin)
router.patch('/:id/status', ctrl.updateStatus);

module.exports = router;