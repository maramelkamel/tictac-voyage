// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');   // ← BUG FIX: was require('../db')
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/mailer');

const JWT_SECRET = process.env.JWT_SECRET || 'tictacvoyage_secret';

// ── Register ──────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const first_name = req.body.first_name || req.body.firstName || '';
    const last_name = req.body.last_name || req.body.lastName || '';
    const email = req.body.email || '';
    const phone = req.body.phone || '';
    const password = req.body.password || '';
    const city = req.body.city || null;
    const marital_status = req.body.marital_status || req.body.maritalStatus || null;
    const rawChildren = req.body.number_of_children ?? req.body.numberOfChildren ?? 0;
    const number_of_children = rawChildren === '' ? 0 : Number(rawChildren) || 0;

    if (!first_name || !last_name || !email || !phone || !password)
      return res.status(400).json({ success: false, message: 'Tous les champs sont obligatoires' });

    const exists = await pool.query('SELECT id FROM clients WHERE email=$1', [email.toLowerCase()]);
    if (exists.rows.length)
      return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé' });

    const hash   = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO clients (first_name, last_name, email, phone, password_hash, city, marital_status, number_of_children)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, first_name, last_name, email, phone, city, marital_status, number_of_children, created_at`,
      [first_name, last_name, email.toLowerCase(), phone, hash, city, marital_status, number_of_children]
    );
    const client = result.rows[0];

    // 🔔 Welcome email — non-blocking
    sendWelcomeEmail(client).catch(err =>
      console.error('❌ Welcome email failed:', err.message)
    );

    const token = jwt.sign({ id: client.id, email: client.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, client });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Login ─────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });

    const result = await pool.query('SELECT * FROM clients WHERE email=$1', [email.toLowerCase()]);
    if (!result.rows.length)
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });

    const client = result.rows[0];
    const ok     = await bcrypt.compare(password, client.password_hash);
    if (!ok)
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });

    const { password_hash, reset_token, reset_token_expires, ...safe } = client;
    const token = jwt.sign({ id: client.id, email: client.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, client: safe });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Get Me ────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, phone, city,
              marital_status, number_of_children, created_at
       FROM clients WHERE id=$1`,
      [req.clientId]
    );
    if (!result.rows.length)
      return res.status(404).json({ success: false, message: 'Client introuvable' });
    res.json({ success: true, client: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Forgot Password — sends a 6-digit code ────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: 'Email requis' });

    const result = await pool.query(
      'SELECT id, first_name, email FROM clients WHERE email=$1',
      [email.toLowerCase()]
    );

    // Always return success to prevent email enumeration
    if (!result.rows.length)
      return res.json({ success: true, message: 'Si cet email existe, un code a été envoyé.' });

    const client    = result.rows[0];
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await pool.query(
      `UPDATE clients SET reset_token=$1, reset_token_expires=$2 WHERE id=$3`,
      [resetCode, expiresAt, client.id]
    );

    await sendPasswordResetEmail({
      email:     client.email,
      firstName: client.first_name,
      resetCode,
    });

    res.json({ success: true, message: 'Si cet email existe, un code a été envoyé.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Verify Reset Code ─────────────────────────────────────────────
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ success: false, message: 'Email et code requis' });

    const result = await pool.query(
      `SELECT id FROM clients
       WHERE email=$1 AND reset_token=$2 AND reset_token_expires > NOW()`,
      [email.toLowerCase(), code]
    );

    if (!result.rows.length)
      return res.status(400).json({ success: false, message: 'Code invalide ou expiré' });

    res.json({ success: true, message: 'Code valide' });
  } catch (err) {
    console.error('Verify code error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Reset Password ────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, password } = req.body;
    if (!email || !code || !password)
      return res.status(400).json({ success: false, message: 'Tous les champs sont requis' });
    if (password.length < 8)
      return res.status(400).json({ success: false, message: 'Minimum 8 caractères' });

    const result = await pool.query(
      `SELECT id FROM clients
       WHERE email=$1 AND reset_token=$2 AND reset_token_expires > NOW()`,
      [email.toLowerCase(), code]
    );

    if (!result.rows.length)
      return res.status(400).json({ success: false, message: 'Code invalide ou expiré' });

    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      `UPDATE clients
       SET password_hash=$1, reset_token=NULL, reset_token_expires=NULL
       WHERE id=$2`,
      [hash, result.rows[0].id]
    );

    res.json({ success: true, message: 'Mot de passe réinitialisé avec succès ✅' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
