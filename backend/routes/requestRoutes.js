// backend/routes/requestRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/transportController');

// ─── Demandes clients ────────────────────────────────────────────
router.get   ('/',           ctrl.getAllRequests);       // GET   /api/requests
router.get   ('/:id',        ctrl.getRequestById);      // GET   /api/requests/:id
router.post  ('/',           ctrl.createRequest);       // POST  /api/requests  ← Transport.jsx
router.patch ('/:id/status', ctrl.updateRequestStatus); // PATCH /api/requests/:id/status
router.delete('/:id',        ctrl.deleteRequest);       // DEL   /api/requests/:id

module.exports = router;