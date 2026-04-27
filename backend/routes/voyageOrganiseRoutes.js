// backend/routes/voyageOrganiseRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/voyageOrganiseController');

// ⚠️ Routes spécifiques AVANT /:id
// Sans ça, Express interprète "voyage-covers" comme un paramètre :id
// et appelle getOne au lieu de getVoyageCovers.
router.get('/voyage-covers', ctrl.getVoyageCovers);
router.put('/voyage-covers', ctrl.updateVoyageCovers);

// Routes CRUD du catalogue des voyages organisés.
// Servent à la fois au frontend public et au back-office admin.
router.route('/').get(ctrl.getAll).post(ctrl.create);
router.route('/:id').get(ctrl.getOne).put(ctrl.update).delete(ctrl.remove);

module.exports = router;