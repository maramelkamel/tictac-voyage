
//   Handles every HTTP request for Omra *reservations*.
const resModel = require('../models/omraReservationModel');
const { sendReservationStatusEmail, sendAgencyReservationEmail } = require('../utils/mailer');



 // Returns aggregate counts (total, pending, confirmed, completed,
// cancelled, online vs agency payments, paid count) from a single
 // SQL aggregation query.

const getStats = async (req, res) => {
  try {
    const stats = await resModel.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('omraReservationController.getStats:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};


// GET /api/omra/reservations
 // Returns a filtered list of reservations.

const getAll = async (req, res) => {
  try {
    const { status, payment_method, search, email } = req.query;
    const reservations = await resModel.getAllReservations({ status, payment_method, search, email });
    res.json({ success: true, data: reservations });
  } catch (err) {
    console.error('omraReservationController.getAll:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};


 //GET /api/omra/reservations/:id
 // Fetches a single reservation by its primary key, joined with the
 // package title for display purposes.

const getOne = async (req, res) => {
  try {
    const reservation = await resModel.getReservationById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    }
    res.json({ success: true, data: reservation });
  } catch (err) {
    console.error('omraReservationController.getOne:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};



/**
 * POST /api/omra/reservations
 *   Both calls use .catch() so email failures never break the response.
 */
const create = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      gender,
      passport_number,
      total_price,
      payment_method,
      chambre_type,
      number_of_persons,
      applied_promotion,
      reservation_title,
    } = req.body;

     //Validation 
    if (!first_name || !last_name || !email || !phone || !gender || !passport_number || !total_price || !payment_method) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }
    if (!['online', 'agency'].includes(payment_method)) {
      return res.status(400).json({ success: false, message: 'Mode de paiement invalide' });
    }

     //Derive status from payment method
    const isOnline = payment_method === 'online';

    // Insert into the DB
    const reservation = await resModel.createReservation({
      ...req.body,
      status: isOnline ? 'confirmed' : 'pending',
      payment_status: isOnline ? 'paid' : 'pending',
    });

    if (isOnline) {
       //Send confirmation email online directly confirmed
      sendReservationStatusEmail({
        email,
        firstName: first_name,
        type: 'omra',
        title: reservation_title || `Forfait Omra #${reservation.package_id || ''}`,
        status: 'confirmed',
        customMessage: 'Le payement en ligne a ete effectuer avec succes.',
        details: {
          Chambre: chambre_type || reservation.chambre_type || 'double',
          Personnes: `${number_of_persons || reservation.number_of_persons || 1} personne(s)`,
          Paiement: '💳 En ligne',
          Total: total_price ? `${Number(total_price).toLocaleString('fr-TN')} TND` : null,
        },
      }).catch((error) => console.error('Omra create email failed:', error.message));
    } else {
      // agency payement 
      sendAgencyReservationEmail({
        email,
        firstName: first_name,
        type: 'omra',
        title: reservation_title || `Forfait Omra #${reservation.package_id || ''}`,
        details: {
          Chambre: chambre_type || reservation.chambre_type || 'double',
          Personnes: `${number_of_persons || reservation.number_of_persons || 1} personne(s)`,
          Paiement: "A l'agence",
          Total: total_price ? `${Number(total_price).toLocaleString('fr-TN')} TND` : null,
          'Code promo': applied_promotion?.code_promo || null,
        },

        // If a promo was applied, remind the client when it expires so
        // they visit the agency before the code becomes invalid.
        promotionReminder: applied_promotion?.date_fin ? {
          code: applied_promotion.code_promo,
          date_fin: applied_promotion.date_fin,
        } : null,
      }).catch((error) => console.error('Omra agency email failed:', error.message));
    }

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






//PATCH /api/omra/reservations/:id/status
// Updates the status and automatically updates payment_status to keep them in sync:
 //  confirmed → payment_status = 'paid'
 //  cancelled → payment_status = 'refunded'
 //   (other statuses leave payment_status unchanged)
 // Also sends a status notification email for confirmed, cancelled, completed.

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }
     // Determine the matching payment_status, if applicable.
    // 'pending' and 'completed' don't change payment_status 
    const paymentStatus = status === 'confirmed'
      ? 'paid'
      : status === 'cancelled'
        ? 'refunded'
        : undefined;

    const reservation = await resModel.updateStatus(id, status, paymentStatus);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    }

    // Send an email only for statuses that the client cares about.
    if (['confirmed', 'cancelled', 'completed'].includes(status)) {
      sendReservationStatusEmail({
        email: reservation.email,
        firstName: reservation.first_name,
        type: 'omra',
        title: reservation.package_title || `Forfait Omra #${reservation.package_id}`,
        status,
        details: {
          Chambre: reservation.chambre_type,
          Personnes: `${reservation.number_of_persons} personne(s)`,
          Paiement: reservation.payment_method === 'online' ? '💳 En ligne' : '🏪 Agence',
          Total: reservation.total_price ? `${Number(reservation.total_price).toLocaleString('fr-TN')} TND` : null,
        },
      }).catch((error) => console.error('Omra status email failed:', error.message));
    }

    res.json({ success: true, data: reservation });
  } catch (err) {
    console.error('omraReservationController.updateStatus:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};


//DELETE /api/omra/reservations/:id
const remove = async (req, res) => {
  try {
    const deleted = await resModel.deleteReservation(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    }
    res.json({ success: true, message: 'Réservation supprimée' });
  } catch (err) {
    console.error('omraReservationController.remove:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { getStats, getAll, getOne, create, updateStatus, remove };

