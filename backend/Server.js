require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// ── Routes ────────────────────────────────────────────────────
const transportRoutes          = require('./routes/transportRoutes');
const requestRoutes            = require('./routes/requestRoutes');
const customTripRoutes         = require('./routes/customTripRoutes');
const contactRoutes            = require('./routes/contactRoutes');
const chatRoutes               = require('./routes/chatRoutes');
const omraRoutes               = require('./routes/omraRoutes');
const omraReservationRoutes    = require('./routes/omraReservationRoutes');
const clientRoutes             = require('./routes/clientRoutes');
const authRoutes               = require('./routes/authRoutes');
const favoritesRoutes          = require('./routes/favoritesRoutes');
const voyageOrganiseRoutes     = require('./routes/voyageOrganiseRoutes');
const voyageReservationRoutes  = require('./routes/voyageReservationRoutes');
const circuitRoutes            = require('./routes/circuitRoutes');
const circuitReservationRoutes = require('./routes/circuitreservationRoutes');
const promotionsRoutes         = require('./routes/promotionsRoutes');
const adminAuthRoutes          = require('./routes/adminAuthRoutes');
const mediaRoutes              = require('./routes/mediaRoutes');



// ── App ───────────────────────────────────────────────────────
const app = express();

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin         : 'http://localhost:5173',
  methods        : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders : ['Content-Type', 'Authorization', 'x-admin-key'],
  credentials    : true,
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static uploads (images) ──────────────────────────────────
// Le dossier est créé si absent pour éviter les erreurs en dev.
try {
  const uploadsDir = path.join(__dirname, 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(uploadsDir));
} catch (e) {
  console.error('[startup] Unable to init uploads folder:', e.message);
}

// ── Routes API ────────────────────────────────────────────────
app.use('/api/transports',           transportRoutes);
app.use('/api/requests',             requestRoutes);
app.use('/api/custom-trips',         customTripRoutes);
app.use('/api/contact',              contactRoutes);
app.use('/api/chat',                 chatRoutes);
app.use('/api/omra/packages',        omraRoutes);
app.use('/api/omra/reservations',    omraReservationRoutes);
app.use('/api/clients',              clientRoutes);
app.use('/api/auth',                 authRoutes);
app.use('/api/favorites',            favoritesRoutes);
app.use('/api/voyages-organises',    voyageOrganiseRoutes);
app.use('/api/voyage-reservations',  voyageReservationRoutes);
app.use('/api/circuits',             circuitRoutes);
app.use('/api/circuit-reservations', circuitReservationRoutes);
app.use('/api/promotions',           promotionsRoutes);
app.use('/api/admin-auth',           adminAuthRoutes);
app.use('/api/media',                mediaRoutes);
app.use('/api/flights', require('./routes/flightRoutes'));
app.use('/api/hotels', require('./routes/hotelRoutes'));

 




// ── Route racine ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🚌 Tic-Tac Voyage API en ligne', version: '1.0.0' });
});

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route introuvable' });
});

// ── Démarrage serveur ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);

 
  // Auto-sync vols si la table est vide
  try {
    const { autoSyncIfEmpty } = require('./services/flightService');
    const pool                = require('./config/db');
    await autoSyncIfEmpty(pool);
  } catch (err) {
    console.error('[startup] Erreur auto-sync vols:', err.message);
  }

  try {
    const { ensureHotelSchema, seedHotelsIfEmpty } = require('./services/hotelService');
    await ensureHotelSchema();
    await seedHotelsIfEmpty();
  } catch (err) {
    console.error('[startup] Erreur hotel bootstrap:', err.message);
  }
});

module.exports = app;
