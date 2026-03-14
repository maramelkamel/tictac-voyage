// ════════════════════════════════════════════════
// backend/routes/omraRoutes.js
// ════════════════════════════════════════════════
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/omraController');

// GET  /api/omra/packages          → all packages (admin) or active (public?public=true)
// POST /api/omra/packages          → create package
router.route('/')
  .get(ctrl.getAll)
  .post(ctrl.create);

// GET    /api/omra/packages/:id    → one package
// PUT    /api/omra/packages/:id    → update package
// DELETE /api/omra/packages/:id    → delete package
router.route('/:id')
  .get(ctrl.getOne)
  .put(ctrl.update)
  .delete(ctrl.remove);

module.exports = router;