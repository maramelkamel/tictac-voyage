// backend/controllers/omraReservationController.js
const resModel                   = require('../models/omraReservationModel');
const { sendReservationStatusEmail } = require('../utils/mailer');

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
    if (!reservation)
      return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    res.json({ success: true, data: reservation });
  } catch (err) {
    console.error('omraReservationController.getOne:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* POST /api/omra/reservations */
const create = async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone,
      gender, passport_number, total_price, payment_method,
    } = req.body;

    if (!first_name || !last_name || !email || !phone ||
        !gender || !passport_number || !total_price || !payment_method)
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });

    if (!['online', 'agency'].includes(payment_method))
      return res.status(400).json({ success: false, message: 'Mode de paiement invalide' });

    const reservation = await resModel.createReservation(req.body);
    res.status(201).json({
      success: true,
      data: reservation,
      message: 'Réservation enregistrée avec succès',
    });
  } catch (err) {
    console.error('omraReservationController.create:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* PATCH /api/omra/reservations/:id/status */
const updateStatus = async (req, res) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status))
      return res.status(400).json({ success: false, message: 'Statut invalide' });

    // Use the model to update — it returns the full row with package_title joined
    const r = await resModel.updateStatus(id, status);
    if (!r)
      return res.status(404).json({ success: false, message: 'Réservation introuvable' });

    // 🔔 Send email for meaningful status changes
    if (['confirmed', 'cancelled', 'completed'].includes(status)) {
      sendReservationStatusEmail({
        email:     r.email,
        firstName: r.first_name,
        type:      'omra',
        title:     r.package_title || `Forfait Omra #${r.package_id}`,
        status,
        details: {
          'Chambre':   r.chambre_type,
          'Personnes': `${r.number_of_persons} personne(s)`,
          'Paiement':  r.payment_method === 'online' ? '💳 En ligne' : '🏪 Agence',
          'Total':     r.total_price
            ? `${Number(r.total_price).toLocaleString('fr-TN')} TND`
            : null,
        },
      }).catch(err => console.error('❌ Omra status email failed:', err.message));
    }

    res.json({ success: true, data: r });
  } catch (err) {
    console.error('omraReservationController.updateStatus:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* DELETE /api/omra/reservations/:id */
const remove = async (req, res) => {
  try {
    const deleted = await resModel.deleteReservation(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    res.json({ success: true, message: 'Réservation supprimée' });
  } catch (err) {
    console.error('omraReservationController.remove:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { getStats, getAll, getOne, create, updateStatus, remove };