// backend/models/adminModel.js
const pool   = require('../config/db');
const bcrypt = require('bcryptjs');

const findByEmail = async (email) => {
  const { rows } = await pool.query(
    'SELECT * FROM public.admins WHERE email = $1',
    [email]
  );
  return rows[0] || null;
};

const findById = async (id) => {
  const { rows } = await pool.query(
    `SELECT id, first_name, last_name, email, occupation, role, is_active, created_at
     FROM public.admins WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

const getAll = async () => {
  const { rows } = await pool.query(
    `SELECT id, first_name, last_name, email, occupation, role, is_active, created_at
     FROM public.admins ORDER BY role DESC, created_at ASC`
  );
  return rows;
};

const createAdmin = async ({ first_name, last_name, email, password, occupation, role }) => {
  const password_hash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    `INSERT INTO public.admins (first_name, last_name, email, password_hash, occupation, role)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id, first_name, last_name, email, occupation, role, is_active, created_at`,
    [first_name, last_name, email, password_hash, occupation || null, role || 'admin']
  );
  return rows[0];
};

const updateAdmin = async (id, { first_name, last_name, email, occupation, role, is_active, password }) => {
  // Build query dynamically — only hash password if provided
  let password_hash;
  if (password) password_hash = await bcrypt.hash(password, 12);

  const { rows } = await pool.query(
    `UPDATE public.admins SET
       first_name  = $1,
       last_name   = $2,
       email       = $3,
       occupation  = $4,
       role        = $5,
       is_active   = $6
       ${password_hash ? ', password_hash = $8' : ''}
     WHERE id = ${password_hash ? '$7' : '$7'}
     RETURNING id, first_name, last_name, email, occupation, role, is_active, created_at`,
    password_hash
      ? [first_name, last_name, email, occupation || null, role || 'admin', is_active !== false, id, password_hash]
      : [first_name, last_name, email, occupation || null, role || 'admin', is_active !== false, id]
  );
  return rows[0] || null;
};

const deleteAdmin = async (id) => {
  const { rows } = await pool.query(
    'DELETE FROM public.admins WHERE id = $1 RETURNING id',
    [id]
  );
  return rows[0] || null;
};

module.exports = { findByEmail, findById, getAll, createAdmin, updateAdmin, deleteAdmin };