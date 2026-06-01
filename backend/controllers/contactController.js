// backend/controllers/contactController.js
const contactModel               = require('../models/contactModel');
const { sendContactReplyEmail }  = require('../utils/mailer');

// ── GET /api/contact?status=&sujet=&search= ───────────────────────
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

// ── GET /api/contact/stats ────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const stats = await contactModel.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('contactController.getStats:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── GET /api/contact/:id ──────────────────────────────────────────
const getOne = async (req, res) => {
  try {
    const msg = await contactModel.getMessageById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message introuvable' });
    res.json({ success: true, data: msg });
  } catch (err) {
    console.error('contactController.getOne:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── POST /api/contact  ← formulaire client ────────────────────────
const create = async (req, res) => {
  try {
    const { nom, email, telephone, sujet, message } = req.body;
    if (!nom || !email || !message)
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });

    const msg = await contactModel.createMessage({ nom, email, telephone, sujet, message });
    res.status(201).json({ success: true, data: msg, message: 'Message envoyé avec succès' });
  } catch (err) {
    console.error('contactController.create:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── PATCH /api/contact/:id/status  ← admin change statut + notes ──
const updateStatus = async (req, res) => {
  try {
    const { id }                  = req.params;
    const { status, reply } = req.body;

    // 1. Fetch current message to detect if reply changed
    const prev = await contactModel.getMessageById(id);
    if (!prev)
      return res.status(404).json({ success: false, message: 'Message introuvable' });

    // 2. Persist the update via model
    const msg = await contactModel.updateStatus(
      id,
      status      || prev.status,
      reply !== undefined ? reply : prev.reply
    );

    // 3. 🔔 Send reply email only when reply is newly added or changed
    const replyAdded =
      reply &&
      reply.trim() !== '' &&
      reply.trim() !== (prev.reply || '').trim();

    if (replyAdded && msg.email) {
      sendContactReplyEmail({
        email:           msg.email,
        firstName:       msg.nom.split(' ')[0],
        subject:         msg.sujet || 'votre demande',
        originalMessage: msg.message,
        reply,
      }).catch(err =>
        console.error('❌ Contact reply email failed:', err.message)
      );
    }

    res.json({ success: true, data: msg });

  } catch (err) {
    console.error('contactController.updateStatus:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── DELETE /api/contact/:id ───────────────────────────────────────
const remove = async (req, res) => {
  try {
    const deleted = await contactModel.deleteMessage(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Message introuvable' });
    res.json({ success: true, message: 'Message supprimé' });
  } catch (err) {
    console.error('contactController.remove:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Single consistent export ──────────────────────────────────────
module.exports = { getAll, getStats, getOne, create, updateStatus, remove };
