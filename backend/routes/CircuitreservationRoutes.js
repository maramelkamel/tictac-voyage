// backend/routes/circuitReservationRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/circuitReservationController');

router.get('/stats',        ctrl.getStats);
router.route('/').get(ctrl.getAll).post(ctrl.create);
router.route('/:id').get(ctrl.getOne).delete(ctrl.remove);
router.patch('/:id/status', ctrl.updateStatus);

module.exports = router;