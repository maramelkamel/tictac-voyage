// backend/controllers/customTripController.js
const model = require('../models/customTripModel');

/* ── GET /api/custom-trips ── */
const getAll = async (req, res) => {
  try {
    const data = await model.getAll();
    res.json({ success: true, data });
  } catch (err) {
    console.error('getAll custom_trips:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* ── GET /api/custom-trips/:id ── */
const getById = async (req, res) => {
  try {
    const trip = await model.getById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Demande introuvable' });
    res.json({ success: true, data: trip });
  } catch (err) {
    console.error('getById custom_trips:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* ── POST /api/custom-trips ── */
const create = async (req, res) => {
  try {
    const { destination, departure_date, return_date, number_of_persons } = req.body;

    // Validation champs obligatoires
    if (!destination || !departure_date || !return_date || !number_of_persons) {
      return res.status(400).json({
        success: false,
        message: 'Champs requis : destination, departure_date, return_date, number_of_persons',
      });
    }

    // Cohérence des dates
    if (new Date(departure_date) >= new Date(return_date)) {
      return res.status(400).json({
        success: false,
        message: 'La date de retour doit être après la date de départ',
      });
    }

    const trip = await model.create(req.body);
    res.status(201).json({ success: true, data: trip, message: 'Demande créée avec succès' });
  } catch (err) {
    console.error('create custom_trips:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* ── PATCH /api/custom-trips/:id/status ── */
const updateStatus = async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Valeurs acceptées : ${validStatuses.join(', ')}`,
      });
    }

    const updated = await model.updateStatus(req.params.id, status, admin_notes);
    if (!updated) return res.status(404).json({ success: false, message: 'Demande introuvable' });

    res.json({ success: true, data: updated, message: 'Statut mis à jour' });
  } catch (err) {
    console.error('updateStatus custom_trips:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* ── DELETE /api/custom-trips/:id ── */
const remove = async (req, res) => {
  try {
    const deleted = await model.remove(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Demande introuvable' });
    res.json({ success: true, message: 'Demande supprimée' });
  } catch (err) {
    console.error('remove custom_trips:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { getAll, getById, create, updateStatus, remove };