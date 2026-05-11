const model = require('../models/voyageReservationModel');
const { sendReservationStatusEmail, sendAgencyReservationEmail } = require('../utils/mailer');

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

const getStats = async (req, res) => {
  try {
    const stats = await model.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('voyageReservationController.getStats:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const getOne = async (req, res) => {
  try {
    const reservation = await model.getReservationById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    }
    res.json({ success: true, data: reservation });
  } catch (err) {
    console.error('voyageReservationController.getOne:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const create = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      total_price,
      payment_method,
      chambre_type,
      number_of_persons,
      applied_promotion,
      reservation_title,
    } = req.body;

    if (!first_name || !last_name || !email || !total_price || !payment_method) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }
    if (!['online', 'agency'].includes(payment_method)) {
      return res.status(400).json({ success: false, message: 'Mode de paiement invalide' });
    }

    const isOnline = payment_method === 'online';
    const reservation = await model.createReservation({
      ...req.body,
      status: isOnline ? 'confirmed' : 'pending',
      payment_status: isOnline ? 'paid' : 'pending',
    });

    if (isOnline) {
      sendReservationStatusEmail({
        email,
        firstName: first_name,
        type: 'voyage',
        title: reservation_title || `Voyage #${reservation.voyage_id || ''}`,
        status: 'confirmed',
        customMessage: 'Le payement en ligne a ete effectuer avec succes.',
        details: {
          Chambre: chambre_type || reservation.chambre_type || 'double',
          Personnes: `${number_of_persons || reservation.number_of_persons || 1} personne(s)`,
          Paiement: '💳 En ligne',
          Total: total_price ? `${Number(total_price).toLocaleString('fr-TN')} TND` : null,
        },
      }).catch((error) => console.error('Voyage create email failed:', error.message));
    } else {
      sendAgencyReservationEmail({
        email,
        firstName: first_name,
        type: 'voyage',
        title: reservation_title || `Voyage #${reservation.voyage_id || ''}`,
        details: {
          Chambre: chambre_type || reservation.chambre_type || 'double',
          Personnes: `${number_of_persons || reservation.number_of_persons || 1} personne(s)`,
          Paiement: "A l'agence",
          Total: total_price ? `${Number(total_price).toLocaleString('fr-TN')} TND` : null,
          'Code promo': applied_promotion?.code_promo || null,
        },
        promotionReminder: applied_promotion?.date_fin ? {
          code: applied_promotion.code_promo,
          date_fin: applied_promotion.date_fin,
        } : null,
      }).catch((error) => console.error('Voyage agency email failed:', error.message));
    }

    res.status(201).json({ success: true, data: reservation, message: 'Réservation enregistrée' });
  } catch (err) {
    console.error('voyageReservationController.create:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }

    const paymentStatus = status === 'confirmed'
      ? 'paid'
      : status === 'cancelled'
        ? 'refunded'
        : undefined;

    const reservation = await model.updateStatus(id, status, paymentStatus);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    }

    if (['confirmed', 'cancelled', 'completed'].includes(status)) {
      sendReservationStatusEmail({
        email: reservation.email,
        firstName: reservation.first_name,
        type: 'voyage',
        title: reservation.voyage_title || `Voyage #${reservation.voyage_id}`,
        status,
        details: {
          Chambre: reservation.chambre_type,
          Personnes: `${reservation.number_of_persons} personne(s)`,
          Paiement: reservation.payment_method === 'online' ? '💳 En ligne' : '🏪 Agence',
          Total: reservation.total_price ? `${Number(reservation.total_price).toLocaleString('fr-TN')} TND` : null,
        },
      }).catch((error) => console.error('Voyage status email failed:', error.message));
    }

    res.json({ success: true, data: reservation });
  } catch (err) {
    console.error('voyageReservationController.updateStatus:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const remove = async (req, res) => {
  try {
    const deleted = await model.deleteReservation(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    }
    res.json({ success: true, message: 'Réservation supprimée' });
  } catch (err) {
    console.error('voyageReservationController.remove:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { getAll, getStats, getOne, create, updateStatus, remove };
