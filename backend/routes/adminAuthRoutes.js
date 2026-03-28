// backend/routes/adminAuthRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/adminAuthController');
const { requireAdmin, requireMainAdmin } = require('../middleware/adminMiddleware');

// Public
router.post('/login', ctrl.login);

// Any authenticated admin
router.get('/me',     requireAdmin, ctrl.getMe);

// Main admin only — manage other admins
router.get('/admins',     requireMainAdmin, ctrl.getAll);
router.post('/admins',    requireMainAdmin, ctrl.create);
router.put('/admins/:id', requireMainAdmin, ctrl.update);
router.delete('/admins/:id', requireMainAdmin, ctrl.remove);

module.exports = router;