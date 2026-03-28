// backend/controllers/adminAuthController.js
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const adminModel = require('../models/adminModel');

const JWT_SECRET  = process.env.JWT_SECRET || 'tictacvoyage_secret';
const JWT_EXPIRES = '12h';

// ── POST /api/admin-auth/login ───────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });

    const admin = await adminModel.findByEmail(email);
    if (!admin)
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });

    if (!admin.is_active)
      return res.status(403).json({ success: false, message: 'Compte désactivé. Contactez l\'administrateur principal.' });

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      admin: {
        id:         admin.id,
        firstName:  admin.first_name,
        lastName:   admin.last_name,
        email:      admin.email,
        occupation: admin.occupation,
        role:       admin.role,
      },
    });
  } catch (err) {
    console.error('adminAuthController.login:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── GET /api/admin-auth/me ───────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const admin = await adminModel.findById(req.adminId);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin introuvable' });
    res.json({ success: true, data: admin });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── GET /api/admin-auth/admins ───────────────────────────────────
const getAll = async (req, res) => {
  try {
    const admins = await adminModel.getAll();
    res.json({ success: true, data: admins });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── POST /api/admin-auth/admins ──────────────────────────────────
const create = async (req, res) => {
  try {
    const { first_name, last_name, email, password, occupation, role } = req.body;
    if (!first_name || !last_name || !email || !password)
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    if (password.length < 8)
      return res.status(400).json({ success: false, message: 'Mot de passe trop court (min 8 caractères)' });

    const existing = await adminModel.findByEmail(email);
    if (existing)
      return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé' });

    // Prevent creating another 'main' admin
    const safeRole = role === 'main' ? 'admin' : (role || 'admin');

    const admin = await adminModel.createAdmin({ first_name, last_name, email, password, occupation, role: safeRole });
    res.status(201).json({ success: true, data: admin, message: 'Admin créé avec succès' });
  } catch (err) {
    console.error('adminAuthController.create:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── PUT /api/admin-auth/admins/:id ───────────────────────────────
const update = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent editing the main admin's role
    const target = await adminModel.findById(id);
    if (!target) return res.status(404).json({ success: false, message: 'Admin introuvable' });
    if (target.role === 'main' && req.body.role !== 'main')
      return res.status(403).json({ success: false, message: 'Impossible de modifier le rôle de l\'admin principal' });

    const admin = await adminModel.updateAdmin(id, req.body);
    res.json({ success: true, data: admin, message: 'Admin mis à jour' });
  } catch (err) {
    console.error('adminAuthController.update:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── DELETE /api/admin-auth/admins/:id ───────────────────────────
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting main admin or self
    const target = await adminModel.findById(id);
    if (!target) return res.status(404).json({ success: false, message: 'Admin introuvable' });
    if (target.role === 'main')
      return res.status(403).json({ success: false, message: 'Impossible de supprimer l\'admin principal' });
    if (parseInt(id) === req.adminId)
      return res.status(403).json({ success: false, message: 'Vous ne pouvez pas vous supprimer vous-même' });

    await adminModel.deleteAdmin(id);
    res.json({ success: true, message: 'Admin supprimé' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { login, getMe, getAll, create, update, remove };