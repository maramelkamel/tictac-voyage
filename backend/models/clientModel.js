// backend/models/clientModel.js
const pool   = require('../config/db');
const bcrypt = require('bcryptjs');

/* CREATE client (register) */
const createClient = async (data) => {
  const {
    first_name, last_name, email, phone, password,
    marital_status, number_of_children, city,
  } = data;

  const password_hash = await bcrypt.hash(password, 10);

  const { rows } = await pool.query(`
    INSERT INTO public.clients
      (first_name, last_name, email, phone, password_hash,
       marital_status, number_of_children, city)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING id, first_name, last_name, email, phone, marital_status, number_of_children, city, created_at
  `, [
    first_name,
    last_name,
    email,
    phone,
    password_hash,
    marital_status      || null,
    number_of_children  || 0,
    city                || null,
  ]);
  return rows[0];
};

/* GET client by email (for login) */
const getClientByEmail = async (email) => {
  const { rows } = await pool.query(
    'SELECT * FROM public.clients WHERE email = $1', [email]
  );
  return rows[0] || null;
};

/* GET client by id */
const getClientById = async (id) => {
  const { rows } = await pool.query(
    'SELECT id, first_name, last_name, email, phone, marital_status, number_of_children, city, created_at FROM public.clients WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

/* GET all clients (admin) */
const getAllClients = async ({ search } = {}) => {
  let q = `
    SELECT id, first_name, last_name, email, phone, city, marital_status, created_at
    FROM public.clients WHERE 1=1
  `;
  const vals = [];
  if (search) {
    q += ` AND (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)`;
    vals.push(`%${search}%`);
  }
  q += ' ORDER BY created_at DESC';
  const { rows } = await pool.query(q, vals);
  return rows;
};

/* VERIFY password */
const verifyPassword = async (plain, hash) => {
  return bcrypt.compare(plain, hash);
};

module.exports = {
  createClient,
  getClientByEmail,
  getClientById,
  getAllClients,
  verifyPassword,
};