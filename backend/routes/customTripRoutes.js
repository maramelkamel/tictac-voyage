// backend/routes/customTripRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/customTripController');

// GET  /api/custom-trips          → toutes les demandes
router.get('/',          ctrl.getAll);

// GET  /api/custom-trips/:id      → une demande
router.get('/:id',       ctrl.getById);

// POST /api/custom-trips          → créer une demande (formulaire client)
router.post('/',         ctrl.create);

// PATCH /api/custom-trips/:id/status → changer le statut (admin)
router.patch('/:id/status', ctrl.updateStatus);

// DELETE /api/custom-trips/:id   → supprimer (admin)
router.delete('/:id',    ctrl.remove);

module.exports = router;