// backend/routes/authRoutes.js
const express    = require('express');
const router     = express.Router();
const jwt        = require('jsonwebtoken');
const controller = require('../controllers/authController');

// ── JWT Middleware ───────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token manquant' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tictacvoyage_secret');
    req.clientId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
  }
};

// ── Routes ───────────────────────────────────────────────────────
router.post('/register', controller.register);
router.post('/login',    controller.login);
router.get('/me',        authMiddleware, controller.getMe);  // protected

module.exports = router;