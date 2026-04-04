// backend/controllers/transportController.js
const model                          = require('../models/transportModel');
const pool                           = require('../config/db');
const { sendReservationStatusEmail, sendPromotionEmail } = require('../utils/mailer');

// ─── CATALOGUE VÉHICULES ────────────────────────────────────────

exports.getAllTransports = async (req, res) => {
  try {
    const data = await model.getAllTransports();
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

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

exports.createTransport = async (req, res) => {
  try {
    const data = await model.createTransport(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

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

exports.getAllRequests = async (req, res) => {
  try {
    const { email } = req.query;
    const data = await model.getAllRequests({ email });
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

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

exports.createRequest = async (req, res) => {
  try {
    const {
      service_type, departure_location, departure_date,
      departure_time, vehicle_type, passengers,
      full_name, email, phone,
    } = req.body;

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

// ── BUG FIX: was missing sendReservationStatusEmail call entirely ──
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    const r = await model.updateRequestStatus(req.params.id, status, admin_notes);
    if (!r) return res.status(404).json({ success: false, message: 'Demande introuvable' });

    // 🔔 Send email for meaningful status changes
    if (['confirmed', 'cancelled', 'completed'].includes(status) && r.email) {
      const title = r.departure_location && r.arrival_location
        ? `${r.departure_location} → ${r.arrival_location}`
        : r.departure_location || 'Transport';

      sendReservationStatusEmail({
        email:     r.email,
        firstName: r.full_name ? r.full_name.split(' ')[0] : 'Client',
        type:      'transport',
        title,
        status,
        details: {
          'Véhicule':   r.vehicle_type,
          'Passagers':  `${r.passengers} passager(s)`,
          'Départ':     r.departure_location,
          'Date':       r.departure_date
            ? new Date(r.departure_date).toLocaleDateString('fr-FR')
            : null,
        },
      }).catch(err => console.error('❌ Transport status email failed:', err.message));
    }

    res.json({ success: true, data: r });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

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

// ─── PROMOTION BLAST ────────────────────────────────────────────
// ── BUG FIX: pool was used but never imported in original file ──
exports.sendBlast = async (req, res) => {
  try {
    const promo = await pool.query('SELECT * FROM promotions WHERE id=$1', [req.params.id]);
    if (!promo.rows.length)
      return res.status(404).json({ success: false, message: 'Promotion introuvable' });

    const promotion = promo.rows[0];
    const clients   = await pool.query(
      'SELECT first_name, email FROM clients ORDER BY created_at DESC'
    );

    let sent = 0, failed = 0;
    for (const client of clients.rows) {
      try {
        await sendPromotionEmail({ email: client.email, firstName: client.first_name, promotion });
        sent++;
      } catch (err) {
        console.error(`❌ Failed to send to ${client.email}:`, err.message);
        failed++;
      }
      await new Promise(r => setTimeout(r, 120)); // avoid Gmail rate limits
    }

    res.json({ success: true, message: `✅ Envoyé à ${sent} client(s). Échecs : ${failed}.`, sent, failed });
  } catch (err) {
    console.error('sendBlast error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};