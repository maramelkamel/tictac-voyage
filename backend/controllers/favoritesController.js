// backend/controllers/favoritesController.js
const favModel = require('../models/favoritesModel');

// GET /api/favorites?type=omra
const getAll = async (req, res) => {
  try {
    const data = await favModel.getByClient(req.clientId, req.query.type || null);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// POST /api/favorites/toggle
const toggle = async (req, res) => {
  try {
    const { item_type, item_id, item_data } = req.body;
    if (!item_type || !item_id) return res.status(400).json({ success: false, message: 'item_type et item_id requis' });
    const result = await favModel.toggle(req.clientId, item_type, item_id, item_data);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { getAll, toggle };

// ─────────────────────────────────────────────────────────────────
// backend/routes/favoritesRoutes.js
// ─────────────────────────────────────────────────────────────────
// (Copy the content below into a separate file: backend/routes/favoritesRoutes.js)
/*
const express    = require('express');
const router     = express.Router();
const jwt        = require('jsonwebtoken');
const ctrl       = require('../controllers/favoritesController');

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

router.get('/',        auth, ctrl.getAll);
router.post('/toggle', auth, ctrl.toggle);

module.exports = router;
*/