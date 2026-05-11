// backend/controllers/authController.js
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../config/db');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/mailer');

const JWT_SECRET = process.env.JWT_SECRET || 'tictacvoyage_secret';
const googleClient = new OAuth2Client();

const signClientToken = (client) =>
  jwt.sign({ id: client.id, email: client.email }, JWT_SECRET, { expiresIn: '7d' });

const sanitizeClient = (client) => {
  const { password_hash, reset_token, reset_token_expires, ...safe } = client;
  return safe;
};

const getGoogleClientId = () => (process.env.GOOGLE_CLIENT_ID || '').trim();

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

    if (!first_name || !last_name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Tous les champs sont obligatoires' });
    }

    const exists = await pool.query('SELECT id FROM clients WHERE email=$1', [email.toLowerCase()]);
    if (exists.rows.length) {
      return res.status(409).json({ success: false, message: 'Cet email est deja utilise' });
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO clients (first_name, last_name, email, phone, password_hash, city, marital_status, number_of_children)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, first_name, last_name, email, phone, city, marital_status, number_of_children, created_at`,
      [first_name, last_name, email.toLowerCase(), phone, hash, city, marital_status, number_of_children]
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

exports.getGoogleClientConfig = async (_req, res) => {
  const clientId = getGoogleClientId();

  if (!clientId) {
    return res.status(503).json({
      success: false,
      message: 'Connexion Google non configuree',
    });
  }

  return res.json({ success: true, clientId });
};

exports.googleLogin = async (req, res) => {
  try {
    const googleClientId = getGoogleClientId();
    const { credential } = req.body || {};

    if (!googleClientId) {
      return res.status(503).json({
        success: false,
        message: 'Connexion Google non configuree',
      });
    }

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Jeton Google requis',
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || payload.email_verified !== true) {
      return res.status(401).json({
        success: false,
        message: 'Compte Google invalide',
      });
    }

    const email = payload.email.toLowerCase();
    const existing = await pool.query('SELECT * FROM clients WHERE email=$1', [email]);

    let client = existing.rows[0];

    if (!client) {
      const generatedPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(generatedPassword, 12);
      const firstName = (payload.given_name || payload.name || 'Compte').trim();
      const lastName = (payload.family_name || 'Google').trim();
      const phone = `google-${payload.sub.slice(-10)}`;

      const created = await pool.query(
        `INSERT INTO clients (
          first_name,
          last_name,
          email,
          phone,
          password_hash,
          city,
          marital_status,
          number_of_children
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *`,
        [firstName, lastName, email, phone, passwordHash, null, null, 0]
      );

      client = created.rows[0];
    }

    const token = signClientToken(client);
    res.json({ success: true, token, client: sanitizeClient(client) });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({
      success: false,
      message: 'Impossible de finaliser la connexion Google',
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, phone, city,
              marital_status, number_of_children, created_at
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
