// backend/controllers/omraReservationController.js
const resModel = require('../models/omraReservationModel');

/* GET /api/omra/reservations/stats */
const getStats = async (req, res) => {
  try {
    const stats = await resModel.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('omraReservationController.getStats:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* GET /api/omra/reservations?status=&payment_method=&search= */
const getAll = async (req, res) => {
  try {
    const { status, payment_method, search } = req.query;
    const reservations = await resModel.getAllReservations({ status, payment_method, search });
    res.json({ success: true, data: reservations });
  } catch (err) {
    console.error('omraReservationController.getAll:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* GET /api/omra/reservations/:id */
const getOne = async (req, res) => {
  try {
    const reservation = await resModel.getReservationById(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    res.json({ success: true, data: reservation });
  } catch (err) {
    console.error('omraReservationController.getOne:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* POST /api/omra/reservations — client submits reservation form */
const create = async (req, res) => {
  try {
    const {
      package_id, first_name, last_name, email, phone,
      gender, passport_number, chambre_type, number_of_persons, total_price, payment_method,
    } = req.body;

    if (!first_name || !last_name || !email || !phone || !gender || !passport_number || !total_price || !payment_method) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }

    const valid_payment = ['online', 'agency'];
    if (!valid_payment.includes(payment_method)) {
      return res.status(400).json({ success: false, message: 'Mode de paiement invalide' });
    }

    const reservation = await resModel.createReservation(req.body);
    res.status(201).json({ success: true, data: reservation, message: 'Réservation enregistrée avec succès' });
  } catch (err) {
    console.error('omraReservationController.create:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* PATCH /api/omra/reservations/:id/status — admin updates status */
const updateStatus = async (req, res) => {
  try {
    const { status, payment_status } = req.body;
    const validStatus  = ['pending', 'confirmed', 'cancelled', 'completed'];
    const validPayment = ['pending', 'paid', 'refunded'];

    if (!validStatus.includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }
    if (payment_status && !validPayment.includes(payment_status)) {
      return res.status(400).json({ success: false, message: 'Statut paiement invalide' });
    }

    const reservation = await resModel.updateStatus(req.params.id, status, payment_status);
    if (!reservation) return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    res.json({ success: true, data: reservation });
  } catch (err) {
    console.error('omraReservationController.updateStatus:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* DELETE /api/omra/reservations/:id */
const remove = async (req, res) => {
  try {
    const deleted = await resModel.deleteReservation(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    res.json({ success: true, message: 'Réservation supprimée' });
  } catch (err) {
    console.error('omraReservationController.remove:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { getStats, getAll, getOne, create, updateStatus, remove };