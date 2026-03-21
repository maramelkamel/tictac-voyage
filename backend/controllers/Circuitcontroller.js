// backend/controllers/circuitController.js
const model = require('../models/circuitModel');

const getAll = async (req, res) => {
  try {
    const data = req.query.public === 'true' ? await model.getActiveCircuits() : await model.getAllCircuits();
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

const getOne = async (req, res) => {
  try {
    const c = await model.getCircuitById(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Circuit introuvable' });
    res.json({ success: true, data: c });
  } catch (err) { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

const create = async (req, res) => {
  try {
    const { title, price, duration } = req.body;
    if (!title || !price || !duration) return res.status(400).json({ success: false, message: 'Titre, prix et durée obligatoires' });
    const c = await model.createCircuit(req.body);
    res.status(201).json({ success: true, data: c, message: 'Circuit créé' });
  } catch (err) { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

const update = async (req, res) => {
  try {
    const { title, price, duration } = req.body;
    if (!title || !price || !duration) return res.status(400).json({ success: false, message: 'Titre, prix et durée obligatoires' });
    const c = await model.updateCircuit(req.params.id, req.body);
    if (!c) return res.status(404).json({ success: false, message: 'Circuit introuvable' });
    res.json({ success: true, data: c, message: 'Circuit mis à jour' });
  } catch (err) { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

const remove = async (req, res) => {
  try {
    const deleted = await model.deleteCircuit(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Circuit introuvable' });
    res.json({ success: true, message: 'Circuit supprimé' });
  } catch (err) { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

module.exports = { getAll, getOne, create, update, remove };