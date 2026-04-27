// backend/routes/mediaRoutes.js
const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/adminMiddleware');
const ctrl = require('../controllers/mediaController');

// POST /api/media/upload
router.post('/upload', requireAdmin, ctrl.uploadImage);

module.exports = router;

