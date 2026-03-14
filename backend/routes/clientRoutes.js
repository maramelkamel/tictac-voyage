// backend/routes/clientRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/clientController');

// POST /api/clients/register   → create account
// POST /api/clients/login      → login
router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);

// GET /api/clients             → all clients (admin)
// GET /api/clients/:id         → one client (admin)
router.route('/')
  .get(ctrl.getAll);

router.route('/:id')
  .get(ctrl.getOne);

module.exports = router;