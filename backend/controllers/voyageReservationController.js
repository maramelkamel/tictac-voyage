// backend/controllers/voyageReservationController.js
const model                          = require('../models/voyageReservationModel');
const { sendReservationStatusEmail } = require('../utils/mailer');

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
    console.error('voyageReservationController.getStats:', err);
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
    console.error('voyageReservationController.getOne:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* POST /api/voyage-reservations */
const create = async (req, res) => {
  try {
    const { first_name, last_name, email, total_price, payment_method } = req.body;
    if (!first_name || !last_name || !email || !total_price || !payment_method)
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    if (!['online', 'agency'].includes(payment_method))
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
    const { id }     = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status))
      return res.status(400).json({ success: false, message: 'Statut invalide' });

    // Use the model — it returns the row with voyage_title joined
    const r = await model.updateStatus(id, status);
    if (!r)
      return res.status(404).json({ success: false, message: 'Réservation introuvable' });

    // 🔔 Send email for meaningful status changes
    if (['confirmed', 'cancelled', 'completed'].includes(status)) {
      sendReservationStatusEmail({
        email:     r.email,
        firstName: r.first_name,
        type:      'voyage',
        title:     r.voyage_title || `Voyage #${r.voyage_id}`,
        status,
        details: {
          'Chambre':   r.chambre_type,
          'Personnes': `${r.number_of_persons} personne(s)`,
          'Paiement':  r.payment_method === 'online' ? '💳 En ligne' : '🏪 Agence',
          'Total':     r.total_price
            ? `${Number(r.total_price).toLocaleString('fr-TN')} TND`
            : null,
        },
      }).catch(err => console.error('❌ Voyage status email failed:', err.message));
    }

    res.json({ success: true, data: r });
  } catch (err) {
    console.error('voyageReservationController.updateStatus:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* DELETE /api/voyage-reservations/:id */
const remove = async (req, res) => {
  try {
    const deleted = await model.deleteReservation(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    res.json({ success: true, message: 'Réservation supprimée' });
  } catch (err) {
    console.error('voyageReservationController.remove:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { getAll, getStats, getOne, create, updateStatus, remove };