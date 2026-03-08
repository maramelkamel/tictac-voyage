// backend/routes/contactRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/contactController');

router.get   ('/',           ctrl.getAll);        // liste + filtres
router.get   ('/stats',      ctrl.getStats);      // stats dashboard
router.get   ('/:id',        ctrl.getOne);        // détail
router.post  ('/',           ctrl.create);        // formulaire client
router.patch ('/:id/status', ctrl.updateStatus);  // admin: statut + notes
router.delete('/:id',        ctrl.remove);        // admin: supprimer

module.exports = router;