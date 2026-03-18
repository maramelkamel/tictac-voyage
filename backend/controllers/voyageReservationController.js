// backend/controllers/voyageReservationController.js
const model = require('../models/voyageReservationModel');

const STATUS_VALID = ['pending','confirmed','cancelled','completed'];

/* GET /api/voyage-reservations */
const getAll = async (req, res) => {
  try {
    const { status, payment_method, email } = req.query;
    const data = await model.getAllReservations({ status, payment_method, email });
    res.json({ success: true, data });
  } catch (err) {
    console.error('voyageReservationController.getAll:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* GET /api/voyage-reservations/stats */
const getStats = async (req, res) => {
  try {
    const stats = await model.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* GET /api/voyage-reservations/:id */
const getOne = async (req, res) => {
  try {
    const r = await model.getReservationById(req.params.id);
    if (!r) return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    res.json({ success: true, data: r });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* POST /api/voyage-reservations */
const create = async (req, res) => {
  try {
    const { first_name, last_name, email, total_price, payment_method } = req.body;
    if (!first_name || !last_name || !email || !total_price || !payment_method)
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    if (!['online','agency'].includes(payment_method))
      return res.status(400).json({ success: false, message: 'Mode de paiement invalide' });
    const r = await model.createReservation(req.body);
    res.status(201).json({ success: true, data: r, message: 'Réservation enregistrée' });
  } catch (err) {
    console.error('voyageReservationController.create:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* PATCH /api/voyage-reservations/:id/status */
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!STATUS_VALID.includes(status))
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    const r = await model.updateStatus(req.params.id, status);
    if (!r) return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    res.json({ success: true, data: r });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* DELETE /api/voyage-reservations/:id */
const remove = async (req, res) => {
  try {
    const deleted = await model.deleteReservation(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    res.json({ success: true, message: 'Réservation supprimée' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { getAll, getStats, getOne, create, updateStatus, remove };