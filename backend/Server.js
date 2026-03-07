// backend/server.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const transportRoutes = require('./routes/transportRoutes');
const requestRoutes   = require('./routes/requestRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────────
app.use(cors({
  origin: '*'
}));
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────
app.use('/api/transports', transportRoutes);  // Catalogue véhicules
app.use('/api/requests',   requestRoutes);    // Demandes clients

// ─── Route test ─────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🚌 Tic-Tac Voyage API en ligne', version: '1.0.0' });
});

// ─── 404 ────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route introuvable' });
});

// ─── Lancement ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});