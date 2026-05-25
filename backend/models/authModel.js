// backend/models/authModel.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// This model helper creates a local email/password client record.
const createClient = async ({ firstName, lastName, email, phone, password, maritalStatus, numberOfChildren, city }) => {
  const password_hash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `INSERT INTO clients
      (first_name, last_name, email, phone, password_hash, marital_status, number_of_children, city)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING id, first_name, last_name, email, phone, city, created_at`,
    [firstName, lastName, email, phone, password_hash,
     maritalStatus || null,
     numberOfChildren !== '' ? parseInt(numberOfChildren) : null,
     city || null]
  );
  return result.rows[0];
};

// This model helper finds a client by email.
const findByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM clients WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
};

// This model helper finds a client by id with safe profile fields.
const findById = async (id) => {
  const result = await pool.query(
    `SELECT id, first_name, last_name, email, phone, marital_status, number_of_children, city, created_at
     FROM clients WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const SAFE_FIELDS = 'id, first_name, last_name, email, phone, city, avatar_url, auth_provider, created_at';
// This model helper links or creates a client account during Google OAuth login.
const upsertGoogleClient = async ({ google_id, email, first_name, last_name, avatar_url }) => {
  // This step reuses an existing Google-linked account when it already exists.
  const byGoogle = await pool.query(
    `SELECT ${SAFE_FIELDS} FROM public.clients WHERE google_id = $1 LIMIT 1`,
    [google_id]
  );
  if (byGoogle.rows[0]) return byGoogle.rows[0];

  // This step links Google auth to an existing local account that uses the same email.
  const byEmail = await pool.query(
    `SELECT ${SAFE_FIELDS} FROM public.clients WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    [email]
  );
  if (byEmail.rows[0]) {
    const { rows } = await pool.query(
      `UPDATE public.clients
       SET google_id = $1, avatar_url = $2, auth_provider = 'google'
       WHERE id = $3
       RETURNING ${SAFE_FIELDS}`,
      [google_id, avatar_url, byEmail.rows[0].id]
    );
    return rows[0];
  }

  // This step creates a brand-new client record for a first-time Google user.
  const { rows } = await pool.query(
    `INSERT INTO public.clients
       (first_name, last_name, email, google_id, avatar_url, auth_provider)
     VALUES ($1, $2, LOWER($3), $4, $5, 'google')
     RETURNING ${SAFE_FIELDS}`,
    [first_name, last_name, email, google_id, avatar_url]
  );
  return rows[0];
};



    


module.exports = { createClient, findByEmail, findById, upsertGoogleClient };
