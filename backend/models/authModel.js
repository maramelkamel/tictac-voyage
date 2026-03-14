// backend/models/authModel.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Create a new client
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

// Find client by email
const findByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM clients WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
};

// Find client by id
const findById = async (id) => {
  const result = await pool.query(
    `SELECT id, first_name, last_name, email, phone, marital_status, number_of_children, city, created_at
     FROM clients WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

module.exports = { createClient, findByEmail, findById };