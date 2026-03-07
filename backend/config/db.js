// backend/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'tictacvoyage',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

// Test de connexion au démarrage
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erreur connexion PostgreSQL :', err.message);
  } else {
    console.log('✅ PostgreSQL connecté avec succès');
    release();
  }
});

module.exports = pool;