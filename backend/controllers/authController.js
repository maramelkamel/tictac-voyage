// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/mailer');

// This secret signs client JWT tokens for email/password authentication.
const JWT_SECRET = process.env.JWT_SECRET || 'tictacvoyage_secret';

// This helper creates the standard client token payload returned by auth endpoints.
const signClientToken = (client) =>
  jwt.sign({ id: client.id, email: client.email }, JWT_SECRET, { expiresIn: '7d' });

// This helper removes sensitive fields before client data is returned to the frontend.
const sanitizeClient = (client) => {
  const { password_hash, reset_token, reset_token_expires, ...safe } = client;
  return safe;
};

// This controller creates a new client account and returns a ready-to-use session token.
exports.register = async (req, res) => {
  try {
    const first_name = req.body.first_name || req.body.firstName || '';
    const last_name = req.body.last_name || req.body.lastName || '';
    const email = req.body.email || '';
    const phone = req.body.phone || '';
    const password = req.body.password || '';
    const city = req.body.city || null;

    if (!first_name || !last_name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Tous les champs sont obligatoires' });
    }

    const exists = await pool.query('SELECT id FROM clients WHERE email=$1', [email.toLowerCase()]);
    if (exists.rows.length) {
      return res.status(409).json({ success: false, message: 'Cet email est deja utilise' });
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO clients (first_name, last_name, email, phone, password_hash, city)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, first_name, last_name, email, phone, city, created_at`,
      [first_name, last_name, email.toLowerCase(), phone, hash, city]
    );
    const client = result.rows[0];

    sendWelcomeEmail(client).catch((err) =>
      console.error('Welcome email failed:', err.message)
    );

    const token = signClientToken(client);
    res.status(201).json({ success: true, token, client });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// This controller validates the client credentials and returns the authenticated session.
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
    }

    const result = await pool.query('SELECT * FROM clients WHERE email=$1', [email.toLowerCase()]);
    if (!result.rows.length) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    const client = result.rows[0];
    const ok = await bcrypt.compare(password, client.password_hash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    const token = signClientToken(client);
    res.json({ success: true, token, client: sanitizeClient(client) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// This controller returns the authenticated client profile for session restoration.
exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, phone, city, created_at
       FROM clients WHERE id=$1`,
      [req.clientId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Client introuvable' });
    }

    res.json({ success: true, client: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// This controller generates and emails a short-lived password reset code.
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email requis' });
    }

    const result = await pool.query(
      'SELECT id, first_name, email FROM clients WHERE email=$1',
      [email.toLowerCase()]
    );

    if (!result.rows.length) {
      return res.json({ success: true, message: 'Si cet email existe, un code a ete envoye.' });
    }

    const client = result.rows[0];
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await pool.query(
      `UPDATE clients SET reset_token=$1, reset_token_expires=$2 WHERE id=$3`,
      [resetCode, expiresAt, client.id]
    );

    await sendPasswordResetEmail({
      email: client.email,
      firstName: client.first_name,
      resetCode,
    });

    res.json({ success: true, message: 'Si cet email existe, un code a ete envoye.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// This controller checks whether the password reset code is still valid.
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email et code requis' });
    }

    const result = await pool.query(
      `SELECT id FROM clients
       WHERE email=$1 AND reset_token=$2 AND reset_token_expires > NOW()`,
      [email.toLowerCase(), code]
    );

    if (!result.rows.length) {
      return res.status(400).json({ success: false, message: 'Code invalide ou expire' });
    }

    res.json({ success: true, message: 'Code valide' });
  } catch (err) {
    console.error('Verify code error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// This controller replaces the password after the email and reset code are verified.
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, password } = req.body;
    if (!email || !code || !password) {
      return res.status(400).json({ success: false, message: 'Tous les champs sont requis' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Minimum 8 caracteres' });
    }

    const result = await pool.query(
      `SELECT id FROM clients
       WHERE email=$1 AND reset_token=$2 AND reset_token_expires > NOW()`,
      [email.toLowerCase(), code]
    );

    if (!result.rows.length) {
      return res.status(400).json({ success: false, message: 'Code invalide ou expire' });
    }

    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      `UPDATE clients
       SET password_hash=$1, reset_token=NULL, reset_token_expires=NULL
       WHERE id=$2`,
      [hash, result.rows[0].id]
    );

    res.json({ success: true, message: 'Mot de passe reinitialise avec succes' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
