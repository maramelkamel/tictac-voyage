

const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const SAFE_FIELDS = `
  id, first_name, last_name, email, phone, city,
  created_at, updated_at
`;

const getClientByEmail = async (email) => {
  if (!email) return null;
  const { rows } = await pool.query(
    'SELECT * FROM public.clients WHERE LOWER(email) = LOWER($1) LIMIT 1',
    [email]
  );
  return rows[0] || null;
};

const getClientById = async (id) => {
  const { rows } = await pool.query(
    `SELECT ${SAFE_FIELDS} FROM public.clients WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

const verifyPassword = async (password, passwordHash) => {
  if (!password || !passwordHash) return false;
  return bcrypt.compare(password, passwordHash);
};

const createClient = async ({
  first_name,
  last_name,
  email,
  phone,
  password,
  city,
}) => {
  const password_hash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    `
    INSERT INTO public.clients
      (first_name, last_name, email, phone, password_hash, city)
    VALUES
      ($1,$2,LOWER($3),$4,$5,$6)
    RETURNING ${SAFE_FIELDS}
  `,
    [
      first_name,
      last_name,
      email,
      phone,
      password_hash,
      city || null,
    ]
  );
  return rows[0];
};

const getAllClients = async ({ search } = {}) => {
  const q = (search || '').trim();
  if (!q) {
    const { rows } = await pool.query(
      `SELECT ${SAFE_FIELDS} FROM public.clients ORDER BY created_at DESC`
    );
    return rows;
  }

  const like = `%${q.toLowerCase()}%`;
  const { rows } = await pool.query(
    `
    SELECT ${SAFE_FIELDS}
    FROM public.clients
    WHERE
      LOWER(first_name) LIKE $1 OR
      LOWER(last_name)  LIKE $1 OR
      LOWER(email)      LIKE $1 OR
      LOWER(phone)      LIKE $1 OR
      LOWER(city)       LIKE $1
    ORDER BY created_at DESC
  `,
    [like]
  );
  return rows;
};

module.exports = {
  getClientByEmail,
  getClientById,
  verifyPassword,
  createClient,
  getAllClients,
};

