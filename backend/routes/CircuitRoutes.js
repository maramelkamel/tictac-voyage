// backend/routes/circuitRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/circuitController');

router.route('/').get(ctrl.getAll).post(ctrl.create);
router.route('/:id').get(ctrl.getOne).put(ctrl.update).delete(ctrl.remove);

module.exports = router;