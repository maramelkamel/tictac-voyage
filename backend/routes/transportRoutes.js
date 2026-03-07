// backend/routes/transportRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/transportController');

// ─── Catalogue véhicules (admin) ────────────────────────────────
router.get   ('/',     ctrl.getAllTransports);   // GET  /api/transports
router.get   ('/:id',  ctrl.getTransportById);  // GET  /api/transports/:id
router.post  ('/',     ctrl.createTransport);   // POST /api/transports
router.put   ('/:id',  ctrl.updateTransport);   // PUT  /api/transports/:id
router.delete('/:id',  ctrl.deleteTransport);   // DEL  /api/transports/:id

module.exports = router;