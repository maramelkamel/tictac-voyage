// backend/controllers/circuitReservationController.js
const model = require('../models/circuitReservationModel');
const VALID = ['pending','confirmed','cancelled','completed'];

const getAll = async (req, res) => {
  try {
    const { status, payment_method, email } = req.query;
    const data = await model.getAllReservations({ status, payment_method, email });
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

const getStats = async (req, res) => {
  try { res.json({ success: true, data: await model.getStats() }); }
  catch (err) { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

const getOne = async (req, res) => {
  try {
    const r = await model.getReservationById(req.params.id);
    if (!r) return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    res.json({ success: true, data: r });
  } catch (err) { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

const create = async (req, res) => {
  try {
    const { first_name, last_name, email, total_price, payment_method } = req.body;
    if (!first_name || !last_name || !email || !total_price || !payment_method)
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    if (!['online','agency'].includes(payment_method))
      return res.status(400).json({ success: false, message: 'Mode de paiement invalide' });
    const r = await model.createReservation(req.body);
    res.status(201).json({ success: true, data: r, message: 'Réservation enregistrée' });
  } catch (err) { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!VALID.includes(status)) return res.status(400).json({ success: false, message: 'Statut invalide' });
    const r = await model.updateStatus(req.params.id, status);
    if (!r) return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    res.json({ success: true, data: r });
  } catch (err) { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

const remove = async (req, res) => {
  try {
    const d = await model.deleteReservation(req.params.id);
    if (!d) return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    res.json({ success: true, message: 'Réservation supprimée' });
  } catch (err) { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

module.exports = { getAll, getStats, getOne, create, updateStatus, remove };