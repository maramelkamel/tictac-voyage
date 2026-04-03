// backend/routes/clientRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/clientController');

// Public
router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);

// Admin / client self-service
router.get('/',       ctrl.getAll);
router.get('/:id',    ctrl.getOne);
router.put('/:id',    ctrl.update);          // update profile
router.delete('/:id', ctrl.deleteClient);    // delete client (main admin only — enforced on frontend)

module.exports = router;