// backend/routes/voyageOrganiseRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/voyageOrganiseController');

// Routes CRUD du catalogue des voyages organisés.
// Elles servent à la fois au frontend public (liste détaillée)
// et au back-office admin (création, modification, suppression).
router.route('/').get(ctrl.getAll).post(ctrl.create);
router.route('/:id').get(ctrl.getOne).put(ctrl.update).delete(ctrl.remove);

module.exports = router;
