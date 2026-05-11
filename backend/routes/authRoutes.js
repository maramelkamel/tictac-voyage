const express    = require('express');
const router     = express.Router();
const jwt        = require('jsonwebtoken');
const controller = require('../controllers/authController');

// ── JWT Middleware ────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'Token manquant' });
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tictacvoyage_secret');
    req.clientId  = decoded.id;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
  }
};

// ── Routes ────────────────────────────────────────────────────────
router.post('/register',           controller.register);
router.post('/login',              controller.login);
router.get ('/google/client-id',   controller.getGoogleClientConfig);
router.post('/google',             controller.googleLogin);
router.get ('/me',                 authMiddleware, controller.getMe);

// Password reset (code-based flow)
router.post('/forgot-password',    controller.forgotPassword);
router.post('/verify-reset-code',  controller.verifyResetCode);
router.post('/reset-password',     controller.resetPassword);

module.exports = router;
