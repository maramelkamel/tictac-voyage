// backend/controllers/contactController.js
const contactModel = require('../models/contactModel');

// GET /api/contact?status=&sujet=&search=
const getAll = async (req, res) => {
  try {
    const { status, sujet, search } = req.query;
    const messages = await contactModel.getAllMessages({ status, sujet, search });
    res.json({ success: true, data: messages });
  } catch (err) {
    console.error('contactController.getAll:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /api/contact/:id
const getOne = async (req, res) => {
  try {
    const msg = await contactModel.getMessageById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message introuvable' });
    res.json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// POST /api/contact  ← formulaire client
const create = async (req, res) => {
  try {
    const { nom, email, telephone, sujet, message } = req.body;
    if (!nom || !email || !sujet || !message) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }
    const msg = await contactModel.createMessage({ nom, email, telephone, sujet, message });
    res.status(201).json({ success: true, data: msg, message: 'Message envoyé avec succès' });
  } catch (err) {
    console.error('contactController.create:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// PATCH /api/contact/:id/status  ← admin change statut
const updateStatus = async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    const valid = ['nouveau', 'lu', 'repondu', 'archive'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }
    const msg = await contactModel.updateStatus(req.params.id, status, admin_notes);
    if (!msg) return res.status(404).json({ success: false, message: 'Message introuvable' });
    res.json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// DELETE /api/contact/:id
const remove = async (req, res) => {
  try {
    const deleted = await contactModel.deleteMessage(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Message introuvable' });
    res.json({ success: true, message: 'Message supprimé' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /api/contact/stats
const getStats = async (req, res) => {
  try {
    const stats = await contactModel.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { getAll, getOne, create, updateStatus, remove, getStats };