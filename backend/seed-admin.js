// backend/seed-admin.js
// Run this ONCE from your backend folder:
//   node seed-admin.js
//
// It will create (or update) the main admin with a real bcrypt hash.

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // OR use individual fields if you don't have DATABASE_URL:
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'tictacvoyage',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function seed() {
  try {
    const email    = 'admin@tictac.tn';
    const password = 'Admin@2026';
    const hash     = await bcrypt.hash(password, 12);

    // Delete existing admin with this email (if any) then re-insert cleanly
    await pool.query('DELETE FROM public.admins WHERE email = $1', [email]);

    await pool.query(`
      INSERT INTO public.admins (first_name, last_name, email, password_hash, occupation, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, ['Super', 'Admin', email, hash, 'Directeur Général', 'main', true]);

    console.log('✅ Main admin created successfully!');
    console.log('   Email   :', email);
    console.log('   Password:', password);
    console.log('   Role    : main');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

seed();