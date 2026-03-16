// backend/routes/favoritesRoutes.js
const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const ctrl    = require('../controllers/favoritesController');

// JWT middleware
const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'Token manquant' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET || 'tictacvoyage_secret');
    req.clientId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

router.get('/',        auth, ctrl.getAll);   // GET  /api/favorites
router.post('/toggle', auth, ctrl.toggle);   // POST /api/favorites/toggle

module.exports = router;