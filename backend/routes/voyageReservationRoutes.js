// backend/routes/voyageReservationRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/voyageReservationController');

// Routes du cycle de vie des réservations :
// consultation, création, statistiques et mise à jour du statut.
router.get('/stats',          ctrl.getStats);
router.route('/').get(ctrl.getAll).post(ctrl.create);
router.route('/:id').get(ctrl.getOne).delete(ctrl.remove);
router.patch('/:id/status',   ctrl.updateStatus);

module.exports = router;
