// ════════════════════════════════════════════════
// backend/routes/omraRoutes.js
// ════════════════════════════════════════════════
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/omraController');
//   GET    /api/omra/packages/omra-covers      → getOmraCovers
//   PUT    /api/omra/packages/omra-covers      → updateOmraCovers
router.get('/omra-covers', ctrl.getOmraCovers);
router.put('/omra-covers', ctrl.updateOmraCovers);

// router.route('/') groups GET and POST on the same path
// GET  /api/omra/packages          → all packages (admin) or active
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


  // Export the router so it can be mounted by the main Express app.
module.exports = router;



