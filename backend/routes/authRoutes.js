const express    = require('express');
const router     = express.Router();
const jwt        = require('jsonwebtoken');
const controller = require('../controllers/authController');
const passport = require('../config/passport');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const JWT_SECRET   = process.env.JWT_SECRET;
const JWT_EXPIRES  = process.env.JWT_EXPIRES_IN || '7d';

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
router.get ('/me',                 authMiddleware, controller.getMe);

// Password reset (code-based flow)
router.post('/forgot-password',    controller.forgotPassword);
router.post('/verify-reset-code',  controller.verifyResetCode);
router.post('/reset-password',     controller.resetPassword);

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/signin?error=google` }),
  (req, res) => {
    const client = req.user;
    const token  = jwt.sign(
      { id: client.id, email: client.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    const params = new URLSearchParams({
      token,
      client: JSON.stringify(client),
    });
    res.redirect(`${FRONTEND_URL}/auth/callback?${params.toString()}`);
  }
);
module.exports = router;
