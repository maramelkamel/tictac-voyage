// backend/controllers/voyageReservationController.js
const model                          = require('../models/voyageReservationModel');
const { sendReservationStatusEmail, sendAgencyReservationEmail } = require('../utils/mailer');

/* GET /api/voyage-reservations
   Liste filtrable des réservations pour les écrans admin et le suivi client. */
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

/* GET /api/voyage-reservations/stats
   Petits indicateurs agrégés pour le tableau de bord admin. */
const getStats = async (req, res) => {
  try {
    const stats = await model.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('voyageReservationController.getStats:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* GET /api/voyage-reservations/:id
   Détail d'une réservation. */
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

/* POST /api/voyage-reservations
   Point d'entrée utilisé par la page Payment du frontend.
   C'est ici que la réservation voyage organisé est réellement enregistrée en base. */
const create = async (req, res) => {
  try {
    const {
      first_name, last_name, email, total_price, payment_method,
      chambre_type, number_of_persons, applied_promotion, reservation_title,
    } = req.body;
    if (!first_name || !last_name || !email || !total_price || !payment_method)
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    if (!['online', 'agency'].includes(payment_method))
      return res.status(400).json({ success: false, message: 'Mode de paiement invalide' });

    const r = await model.createReservation(req.body);
    if (payment_method === 'agency') {
      sendAgencyReservationEmail({
        email,
        firstName: first_name,
        type: 'voyage',
        title: reservation_title || `Voyage #${r.voyage_id || ''}`,
        details: {
          'Chambre': chambre_type || r.chambre_type || 'double',
          'Personnes': `${number_of_persons || r.number_of_persons || 1} personne(s)`,
          'Paiement': "A l'agence",
          'Total': total_price ? `${Number(total_price).toLocaleString('fr-TN')} TND` : null,
          'Code promo': applied_promotion?.code_promo || null,
        },
        promotionReminder: applied_promotion?.date_fin ? {
          code: applied_promotion.code_promo,
          date_fin: applied_promotion.date_fin,
        } : null,
      }).catch(err => console.error('Voyage agency email failed:', err.message));
    } else {
      sendReservationStatusEmail({
        email,
        firstName: first_name,
        type: 'voyage',
        title: reservation_title || `Voyage #${r.voyage_id || ''}`,
        status: 'pending',
        details: {
          'Chambre': chambre_type || r.chambre_type || 'double',
          'Personnes': `${number_of_persons || r.number_of_persons || 1} personne(s)`,
          'Paiement': '💳 En ligne',
          'Total': total_price ? `${Number(total_price).toLocaleString('fr-TN')} TND` : null,
        },
      }).catch(err => console.error('Voyage create email failed:', err.message));
    }
    res.status(201).json({ success: true, data: r, message: 'Réservation enregistrée' });
  } catch (err) {
    console.error('voyageReservationController.create:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* PATCH /api/voyage-reservations/:id/status
   Change l'état métier de la réservation et déclenche éventuellement un email. */
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

    // Envoi d'email uniquement pour les statuts significatifs côté client.
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

/* DELETE /api/voyage-reservations/:id
   Suppression d'une réservation depuis l'administration. */
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
