// backend/server.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const transportRoutes = require('./routes/transportRoutes');
const requestRoutes   = require('./routes/requestRoutes');
const customTripRoutes = require('./routes/customTripRoutes');
const contactRoutes    = require('./routes/contactRoutes');
const chatRoutes = require('./routes/chatRoutes');
const omraRoutes = require('./routes/omraRoutes');
const omraReservationRoutes = require('./routes/omraReservationRoutes');
const clientRoutes = require('./routes/clientRoutes');
const authRoutes = require('./routes/authRoutes');
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
app.use('/api/custom-trips', customTripRoutes);  // Voyages sur mesure
app.use('/api/contact',      contactRoutes);     // Messages de contact
app.use('/api/chat', chatRoutes);
app.use('/api/omra/packages', omraRoutes);
app.use('/api/omra/reservations', omraReservationRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/auth', authRoutes);



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