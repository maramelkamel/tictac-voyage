// backend/routes/circuitRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/circuitController');

// ⚠️ Routes spécifiques AVANT /:id sinon Express traite "circuit-covers" comme un id
router.get('/circuit-covers', ctrl.getCircuitCovers);
router.put('/circuit-covers', ctrl.updateCircuitCovers);

router.route('/').get(ctrl.getAll).post(ctrl.create);
router.route('/:id').get(ctrl.getOne).put(ctrl.update).delete(ctrl.remove);

module.exports = router;