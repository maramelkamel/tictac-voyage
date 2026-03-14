// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const authModel = require('../models/authModel');

const JWT_SECRET  = process.env.JWT_SECRET || 'tictacvoyage_secret';
const JWT_EXPIRES = '7d';

// ── POST /api/auth/register ──────────────────────────────────────
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, maritalStatus, numberOfChildren, city } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Mot de passe trop court (min 8 caractères)' });
    }

    // Check if email already exists
    const existing = await authModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé' });
    }

    // Create client
    const client = await authModel.createClient({
      firstName, lastName, email, phone, password,
      maritalStatus, numberOfChildren, city
    });

    // Generate token
    const token = jwt.sign(
      { id: client.id, email: client.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      token,
      client: {
        id:         client.id,
        firstName:  client.first_name,
        lastName:   client.last_name,
        email:      client.email,
        phone:      client.phone,
      }
    });

  } catch (err) {
    console.error('authController.register:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── POST /api/auth/login ─────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
    }

    // Find client
    const client = await authModel.findByEmail(email);
    if (!client) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, client.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    // Generate token
    const token = jwt.sign(
      { id: client.id, email: client.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      client: {
        id:        client.id,
        firstName: client.first_name,
        lastName:  client.last_name,
        email:     client.email,
        phone:     client.phone,
      }
    });

  } catch (err) {
    console.error('authController.login:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── GET /api/auth/me ─────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const client = await authModel.findById(req.clientId);
    if (!client) return res.status(404).json({ success: false, message: 'Client introuvable' });
    res.json({ success: true, data: client });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { register, login, getMe };