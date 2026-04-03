// backend/routes/customTripRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/customTripController');

router.get('/',              ctrl.getAll);
router.get('/:id',           ctrl.getById);
router.post('/',             ctrl.create);
router.patch('/:id/status',  ctrl.updateStatus);
router.patch('/:id/quote',   ctrl.updateQuote);   // admin sends price + message to client
router.delete('/:id',        ctrl.remove);

module.exports = router;