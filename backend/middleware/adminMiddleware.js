// backend/middleware/adminMiddleware.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tictacvoyage_secret';

// ── Verify any admin token ────────────────────────────────────────
const requireAdmin = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token admin manquant' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.adminId) {
      return res.status(403).json({ success: false, message: 'Accès réservé aux admins' });
    }
    req.adminId   = decoded.adminId;
    req.adminRole = decoded.role;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
  }
};

// ── Only main admin can manage other admins ───────────────────────
const requireMainAdmin = (req, res, next) => {
  requireAdmin(req, res, () => {
    if (req.adminRole !== 'main') {
      return res.status(403).json({ success: false, message: 'Réservé à l\'administrateur principal' });
    }
    next();
  });
};

module.exports = { requireAdmin, requireMainAdmin };