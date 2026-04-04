// backend/controllers/customTripController.js
const model                          = require('../models/customTripModel');
const pool                           = require('../config/db');
const { sendReservationStatusEmail } = require('../utils/mailer');

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
    if (!destination || !departure_date || !return_date || !number_of_persons)
      return res.status(400).json({ success: false, message: 'Champs requis : destination, departure_date, return_date, number_of_persons' });
    if (new Date(departure_date) >= new Date(return_date))
      return res.status(400).json({ success: false, message: 'La date de retour doit être après la date de départ' });

    const trip = await model.create(req.body);
    res.status(201).json({ success: true, data: trip, message: 'Demande créée avec succès' });
  } catch (err) {
    console.error('create custom_trips:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* ── PATCH /api/custom-trips/:id/status ── */
// ── BUG FIX: was missing sendReservationStatusEmail call entirely ──
const updateStatus = async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    const valid = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!status || !valid.includes(status))
      return res.status(400).json({ success: false, message: `Statut invalide. Valeurs acceptées : ${valid.join(', ')}` });

    const r = await model.updateStatus(req.params.id, status, admin_notes);
    if (!r) return res.status(404).json({ success: false, message: 'Demande introuvable' });

    // 🔔 Send email for meaningful status changes
    if (['confirmed', 'cancelled', 'completed'].includes(status) && r.email) {
      const nights = r.departure_date && r.return_date
        ? Math.ceil(Math.abs(new Date(r.return_date) - new Date(r.departure_date)) / 86400000)
        : null;

      sendReservationStatusEmail({
        email:     r.email,
        firstName: r.full_name ? r.full_name.split(' ')[0] : 'Client',
        type:      'custom',
        title:     r.destination,
        status,
        details: {
          'Destination': r.destination,
          'Voyageurs':   `${r.number_of_persons} personne(s)`,
          'Départ':      r.departure_date ? new Date(r.departure_date).toLocaleDateString('fr-FR') : null,
          'Retour':      r.return_date    ? new Date(r.return_date).toLocaleDateString('fr-FR')    : null,
          'Durée':       nights           ? `${nights} nuit(s)`                                    : null,
          'Offre prix':  r.quoted_price   ? `${Number(r.quoted_price).toLocaleString('fr-TN')} TND` : null,
        },
      }).catch(err => console.error('❌ CustomTrip status email failed:', err.message));
    }

    res.json({ success: true, data: r, message: 'Statut mis à jour' });
  } catch (err) {
    console.error('updateStatus custom_trips:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* ── PATCH /api/custom-trips/:id/quote ── */
// Saves the admin's quoted price + message — visible to the client in their profile
const updateQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { quoted_price, admin_message } = req.body;

    const { rows } = await pool.query(
      `UPDATE public.custom_trips
       SET quoted_price  = $1,
           admin_message = $2,
           updated_at    = NOW()
       WHERE id = $3
       RETURNING *`,
      [quoted_price ? Number(quoted_price) : null, admin_message || null, id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Demande introuvable' });
    res.json({ success: true, data: rows[0], message: 'Offre envoyée avec succès' });
  } catch (err) {
    console.error('updateQuote custom_trips:', err.message);
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

module.exports = { getAll, getById, create, updateStatus, updateQuote, remove };