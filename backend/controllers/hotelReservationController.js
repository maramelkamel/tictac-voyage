// backend/controllers/hotelReservationController.js
const model = require('../models/hotelReservationModel');

const getAll = async (req, res) => {
  try {
    const data = req.query.public === 'true'
      ? await model.getAllReservations({ status: 'confirmed' })
      : await model.getAllReservations(req.query);
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
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
    const { full_name, email, check_in, check_out, total } = req.body;
    if (!full_name || !email || !check_in || !check_out || !total)
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    const r = await model.createReservation(req.body);
    res.status(201).json({ success: true, reservation: r, message: 'Réservation créée' });
  } catch (err) { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

const update = async (req, res) => {
  try {
    const r = await model.updateReservation(req.params.id, req.body);
    if (!r) return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    res.json({ success: true, reservation: r, message: 'Réservation mise à jour' });
  } catch (err) { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

const remove = async (req, res) => {
  try {
    const deleted = await model.deleteReservation(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    res.json({ success: true, message: 'Réservation supprimée' });
  } catch (err) { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

module.exports = { getAll, getOne, create, update, remove };