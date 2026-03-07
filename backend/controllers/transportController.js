// backend/controllers/transportController.js
const model = require('../models/transportModel');

// ─── CATALOGUE VÉHICULES ────────────────────────────────────────

// GET /api/transports
exports.getAllTransports = async (req, res) => {
  try {
    const data = await model.getAllTransports();
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /api/transports/:id
exports.getTransportById = async (req, res) => {
  try {
    const data = await model.getTransportById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Transport introuvable' });
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// POST /api/transports
exports.createTransport = async (req, res) => {
  try {
    const data = await model.createTransport(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// PUT /api/transports/:id
exports.updateTransport = async (req, res) => {
  try {
    const data = await model.updateTransport(req.params.id, req.body);
    if (!data) return res.status(404).json({ success: false, message: 'Transport introuvable' });
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// DELETE /api/transports/:id
exports.deleteTransport = async (req, res) => {
  try {
    const data = await model.deleteTransport(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Transport introuvable' });
    res.json({ success: true, message: 'Transport supprimé', data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─── DEMANDES CLIENTS ───────────────────────────────────────────

// GET /api/requests
exports.getAllRequests = async (req, res) => {
  try {
    const data = await model.getAllRequests();
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /api/requests/:id
exports.getRequestById = async (req, res) => {
  try {
    const data = await model.getRequestById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Demande introuvable' });
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// POST /api/requests  ← appelé depuis Transport.jsx
exports.createRequest = async (req, res) => {
  try {
    const {
      service_type, trip_type, duration_type, number_of_days,
      departure_location, arrival_location,
      departure_date, departure_time,
      vehicle_type, passengers,
      full_name, email, phone
    } = req.body;

    // Validation minimale côté serveur
    if (!service_type || !departure_location || !departure_date ||
        !departure_time || !vehicle_type || !passengers ||
        !full_name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }

    const data = await model.createRequest(req.body);
    res.status(201).json({ success: true, data, message: 'Demande enregistrée avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// PATCH /api/requests/:id/status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    const data = await model.updateRequestStatus(req.params.id, status, admin_notes);
    if (!data) return res.status(404).json({ success: false, message: 'Demande introuvable' });
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// DELETE /api/requests/:id
exports.deleteRequest = async (req, res) => {
  try {
    const data = await model.deleteRequest(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Demande introuvable' });
    res.json({ success: true, message: 'Demande supprimée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};