// backend/controllers/flightController.js

const duffelService     = require('../services/duffelService');
const FlightReservation = require('../models/flightReservationModel');
const { sendReservationStatusEmail } = require('../utils/mailer');

// ─────────────────────────────────────────────────────────────────
//  UTILITAIRES INTERNES
// ─────────────────────────────────────────────────────────────────

// ── Normalise un numéro brut vers le format international E.164 ──
// E.164 = +<indicatif><numéro>, ex : +21620123456
// Duffel exige ce format pour le champ phone_number des passagers.
const toE164 = (raw = '') => {
  // Supprime espaces, tirets, parenthèses, points
  let s = String(raw).replace(/[\s\-().]/g, '');

  // Détecte un numéro tunisien local à 8 chiffres (commence par 2,3,4,5,7,8,9)
  // et lui préfixe l'indicatif +216
  if (/^[2345789]\d{7}$/.test(s)) s = '+216' + s;

  // Si toujours pas de +, on l'ajoute (cas d'un numéro étranger sans indicatif)
  if (!s.startsWith('+')) s = '+' + s;

  return s;
};

// ── Détecte si une erreur Duffel signifie que l'offre a expiré ───
// Duffel peut renvoyer l'expiration sous plusieurs formulations —
// cette fonction unifie la détection pour éviter les répétitions.
const isOfferExpiredError = (err) => {
  // Récupère le message depuis err.errors[0].message (format Duffel)
  // ou err.message (format générique), normalisé en minuscules
  const msg = (err?.errors?.[0]?.message || err?.message || '').toLowerCase();

  return (
    msg.includes('select another offer') || // Duffel : "please select another offer"
    msg.includes('no longer available')  || // Duffel : "this offer is no longer available"
    msg.includes('offer has expired')    || // variante
    msg.includes('offer is expired')     || // variante
    msg.includes('availability')         || // changement de disponibilité
    msg.includes('expired')                 // cas générique
  );
};

// ── Parse le champ passengers (peut être string JSON ou tableau) ─
// Utile car en base de données passengers est stocké en JSON texte.
const parsePassengers = (passengers) => {
  if (Array.isArray(passengers)) return passengers; // déjà un tableau
  try {
    return JSON.parse(passengers || '[]'); // parse la string JSON
  } catch {
    return []; // retourne tableau vide si parse échoue
  }
};

// ─────────────────────────────────────────────────────────────────
//  RECHERCHE DE VOLS
// ─────────────────────────────────────────────────────────────────

// POST /api/flights/search
// Route publique — pas de token requis.
// Body attendu : { slices, passengers, cabin_class?, max_connections? }
// La marge agence (10%) et la conversion EUR→TND sont appliquées
// automatiquement dans duffelService.normaliseOffer() via toTND().
const searchFlights = async (req, res) => {
  try {
    const { slices, passengers, cabin_class, max_connections } = req.body;

    // Validations minimales — Duffel rejettera de toute façon sans ces champs
    if (!slices?.length)
      return res.status(400).json({ success: false, message: 'slices is required.' });
    if (!passengers?.length)
      return res.status(400).json({ success: false, message: 'passengers is required.' });
 
    // Appel au service Duffel — retourne les offres déjà normalisées en TND
    const result = await duffelService.searchFlights({
      slices,
      passengers,
      cabin_class:     cabin_class ?? 'economy', // fallback économique si non fourni
      max_connections,                            // undefined = pas de filtre direct
    });

    // Les offres retournées ont déjà total_amount en TND + marge 10%
    // via normaliseOffer() dans duffelService — aucune modification ici
    return res.json({
      success:          true,
      offer_request_id: result.id,
      offers:           result.offers,
    });

  } catch (err) {
    console.error('[searchFlights]', err?.errors ?? err.message);
    return res.status(500).json({
      success: false,
      message: err?.errors?.[0]?.message ?? err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────
//  DÉTAIL D'UNE OFFRE
// ─────────────────────────────────────────────────────────────────

// GET /api/flights/offer/:offerId
// Route publique — récupère une offre à jour depuis Duffel.
// Utilisé dans FlightDetails pour vérifier que l'offre n'a pas expiré
// et afficher les informations fraîches avant réservation.
const getOffer = async (req, res) => {
  try {
    // getOffer normalise aussi l'offre (TND + marge) via normaliseOffer()
    const offer = await duffelService.getOffer(req.params.offerId);

    return res.json({ success: true, offer });

  } catch (err) {
    console.error('[getOffer]', err?.errors ?? err.message);

    // Réponse spécifique 410 Gone si l'offre a expiré
    // 410 = la ressource existait mais n'existe plus (plus approprié que 404)
    if (isOfferExpiredError(err)) {
      return res.status(410).json({
        success: false,
        expired: true,
        message: "Cette offre n'est plus disponible. Veuillez effectuer une nouvelle recherche.",
      });
    }

    return res.status(500).json({
      success: false,
      message: err?.errors?.[0]?.message ?? err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────
//  RÉSERVATION D'UN VOL
// ─────────────────────────────────────────────────────────────────

// POST /api/flights/book
// Route protégée — requireClient vérifie le JWT et injecte req.clientId.
// Body attendu : { offer_id, passengers, payment_method? }
//
// Flux :
//  1. Validation des champs requis
//  2. Normalisation des numéros de téléphone en E.164
//  3. Récupération de l'offre fraîche (vérifie non expirée)
//  4. Construction du payload de paiement en devise ORIGINALE (EUR) pour Duffel
//  5. Création de la commande chez Duffel
//  6. Sauvegarde de la réservation en base (prix en TND affiché au client)
//  7. Envoi de l'email de confirmation
const bookFlight = async (req, res) => {
  try {
    const {
      offer_id,
      passengers,
      payment_method = 'agency', // 'agency' = paiement en agence (défaut), 'online' = CB
    } = req.body;

    // req.clientId est injecté par le middleware requireClient après vérification JWT
    const userId = req.clientId || null;

    // Validations de présence
    if (!offer_id)
      return res.status(400).json({ success: false, message: 'offer_id is required.' });
    if (!passengers?.length)
      return res.status(400).json({ success: false, message: 'passengers is required.' });

    // Normalise chaque numéro de téléphone passager en E.164
    // Duffel rejette les numéros mal formatés
    const normalizedPassengers = passengers.map(p => ({
      ...p,
      phone_number: toE164(p.phone_number || ''),
    }));

    // ── Étape 3 : récupération de l'offre fraîche ────────────────
    // On re-fetch l'offre juste avant de réserver pour s'assurer
    // qu'elle n'a pas expiré entre la recherche et la confirmation.
    let offer;
    try {
      offer = await duffelService.getOffer(offer_id);
    } catch (err) {
      if (isOfferExpiredError(err)) {
        return res.status(410).json({
          success: false,
          expired: true,
          message: "Cette offre a expiré. Veuillez effectuer une nouvelle recherche.",
        });
      }
      throw err; // re-lance si c'est une autre erreur → capturé par le catch externe
    }

    // ── Étape 4 : payload de paiement pour Duffel ────────────────
    // IMPORTANT : on paie Duffel avec le montant ORIGINAL en EUR,
    // pas avec le prix TND (qui inclut notre marge agence).
    // _original_amount et _original_currency sont conservés par normaliseOffer().
    const paymentPayload = {
      type:     'balance',               // paiement depuis le solde du compte Duffel de l'agence
      amount:   offer._original_amount,   // ex: "127.50" EUR — ce que Duffel facture
      currency: offer._original_currency, // ex: "EUR"
    };

    // ── Étape 5 : création de la commande chez Duffel ────────────
    let order;
    try {
      order = await duffelService.bookFlight({
        offer_id,
        passengers: normalizedPassengers,
        payments:   paymentPayload,
      });
    } catch (err) {
      // L'offre peut expirer entre le getOffer et le bookFlight
      // (rare mais possible en période de forte demande)
      if (isOfferExpiredError(err)) {
        return res.status(410).json({
          success: false,
          expired: true,
          message: "Les disponibilités ont changé pendant votre réservation. Veuillez sélectionner une nouvelle offre.",
        });
      }
      throw err;
    }

    // ── Étape 6 : sauvegarde en base ─────────────────────────────
    // Le prix sauvegardé est total_amount (TND avec marge) — ce que le client paie.
    // _original_amount (EUR) n'est pas stocké en base car c'est un détail interne.

    const isOnline     = payment_method === 'online'; // booléen pour éviter répétitions
    const firstSlice   = offer.slices?.[0];
    const firstSegment = firstSlice?.segments?.[0];
    // lastSegment = dernier segment du premier slice → donne la destination finale
    const lastSegment  = firstSlice?.segments?.[firstSlice?.segments?.length - 1];
    const firstPax     = normalizedPassengers[0]; // passager principal pour email + notes

    const reservation = await FlightReservation.create({
      user_id:          userId,
      duffel_order_id:  order.id,                                        // référence Duffel
      offer_id,
      origin_iata:      firstSegment?.origin?.iata_code        || null,
      destination_iata: lastSegment?.destination?.iata_code
                        || firstSegment?.destination?.iata_code || null, // fallback si 1 segment
      airline_name:     firstSegment?.marketing_carrier?.name  || null,
      flight_number:    firstSegment?.marketing_carrier_flight_number || null,
      departing_at:     firstSegment?.departing_at             || null,
      arriving_at:      lastSegment?.arriving_at
                        || firstSegment?.arriving_at            || null, // fallback
      cabin_class:      offer.cabin_class                      || 'economy',
      total_price:      offer.total_amount,  // prix TND avec marge — affiché au client
      currency:         'TND',
      passengers:       normalizedPassengers,
      // Statuts selon le mode de paiement :
      // online  → confirmé + payé immédiatement
      // agency  → en attente jusqu'à confirmation manuelle par l'admin
      status:           isOnline ? 'confirmed' : 'pending',
      payment_status:   isOnline ? 'paid'      : 'pending',
      payment_method,
      // Note de contact pour l'admin depuis le premier passager
      notes: firstPax?.email ? `Contact: ${firstPax.email}` : null,
    });

    // ── Étape 7 : email de confirmation ──────────────────────────
    // Envoyé pour les deux méthodes de paiement :
    // - online  → email "Réservation confirmée"
    // - agency  → email "Réservation en attente de paiement"
    // .catch() sans await : l'email est en arrière-plan.
    // Un échec d'email ne doit PAS faire échouer la réservation.
    const emailRecipient = firstPax?.email;
    const emailFirstName = firstPax?.given_name || 'Client';

    if (emailRecipient) {
      sendReservationStatusEmail({
        email:     emailRecipient,
        firstName: emailFirstName,
        type:      'flight',
        title:     `${reservation.origin_iata || '?'} → ${reservation.destination_iata || '?'}`,
        status:    isOnline ? 'confirmed' : 'pending',
        details: {
          'Compagnie': reservation.airline_name,
          'Vol':       reservation.flight_number,
          'Départ':    reservation.departing_at
                         ? new Date(reservation.departing_at).toLocaleString('fr-FR') : null,
          'Classe':    reservation.cabin_class,
          'Paiement':  isOnline ? '💳 En ligne' : "🏪 À l'agence",
          'Total':     reservation.total_price
                         ? `${Number(reservation.total_price).toLocaleString('fr-TN')} ${reservation.currency || 'TND'}` : null,
          'Référence': reservation.duffel_order_id || null,
        },
      }).catch(err =>
        console.error('❌ Booking confirmation email failed:', err.message)
      );
    }

    return res.status(201).json({
      success:      true,
      message:      isOnline
        ? 'Réservation confirmée et payée.'
        : 'Réservation créée. Paiement en attente.',
      reservation,
      duffel_order: order,
    });

  } catch (err) {
    console.error('[bookFlight]', err?.errors ?? err.message);
    return res.status(500).json({
      success: false,
      message: err?.errors?.[0]?.message ?? err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────
//  LECTURE DES RÉSERVATIONS
// ─────────────────────────────────────────────────────────────────

// GET /api/flights/reservations — admin seulement
// Retourne toutes les réservations pour le tableau de bord admin.
const getReservations = async (req, res) => {
  try {
    return res.json({
      success: true,
      data:    await FlightReservation.getAllForAdmin(),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/flights/mine — client connecté seulement
// Retourne les réservations de l'utilisateur connecté (req.clientId injecté par requireClient).
const getMyReservations = async (req, res) => {
  try {
    return res.json({
      success: true,
      data:    await FlightReservation.findByUserId(req.clientId),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
//  MISE À JOUR DE STATUT — ADMIN
// ─────────────────────────────────────────────────────────────────

// PATCH /api/flights/reservations/:id/status — admin seulement
// Met à jour le statut d'une réservation et envoie un email au client.
//
// Règle métier : seul l'admin principal (adminRole === 'main') peut annuler.
// Les sous-admins peuvent confirmer ou marquer comme complété seulement.
const updateReservationStatus = async (req, res) => {
  try {
    const { id }     = req.params; // ID de la réservation en base
    const { status } = req.body;

    // Liste des statuts autorisés
    const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: 'Statut invalide.' });

    // 🔒 Protection : annulation réservée à l'admin principal
    // req.adminRole est injecté par le middleware requireAdmin
    if (status === 'cancelled' && req.adminRole !== 'main')
      return res.status(403).json({
        success: false,
        message: "Seul l'administrateur principal peut annuler une réservation de vol.",
      });

    // Vérifie l'existence de la réservation avant mise à jour
    const existing = await FlightReservation.findById(id);
    if (!existing)
      return res.status(404).json({ success: false, message: 'Réservation introuvable.' });

    // Calcule le nouveau payment_status selon le statut métier :
    // confirmed → paid | cancelled → refunded | autre → undefined (pas de changement)
    const paymentStatus = status === 'confirmed' ? 'paid'
                        : status === 'cancelled'  ? 'refunded'
                        : undefined;

    const reservation = await FlightReservation.updateStatus(id, status, paymentStatus);

    // ── Email de notification au client ─────────────────────────
    // Envoyé à chaque changement significatif de statut.
    // parsePassengers gère le cas où passengers est une string JSON (stockage en base).
    const parsedPax = parsePassengers(reservation?.passengers);
    const firstPax  = parsedPax[0];

    // Essaie d'abord les champs dénormalisés (client_email, client_first_name)
    // puis tombe sur les données passager si absent
    const email     = existing.client_email      || firstPax?.email;
    const firstName = existing.client_first_name || firstPax?.given_name || 'Client';

    if (email) {
      sendReservationStatusEmail({
        email,
        firstName,
        type:   'flight',
        title:  `${reservation.origin_iata || '?'} → ${reservation.destination_iata || '?'}`,
        status,
        details: {
          'Compagnie': reservation.airline_name,
          'Vol':       reservation.flight_number,
          'Départ':    reservation.departing_at
                         ? new Date(reservation.departing_at).toLocaleString('fr-FR') : null,
          'Classe':    reservation.cabin_class,
          'Paiement':  reservation.payment_method === 'online' ? '💳 En ligne' : '🏪 Agence',
          'Total':     reservation.total_price
                         ? `${Number(reservation.total_price).toLocaleString('fr-TN')} ${reservation.currency || 'TND'}` : null,
        },
      }).catch(err =>
        console.error('❌ Flight status email failed:', err.message)
      );
    }

    return res.json({ success: true, reservation });

  } catch (err) {
    console.error('[updateReservationStatus]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────────────────────────

module.exports = {
  searchFlights,
  getOffer,
  bookFlight,
  getReservations,
  getMyReservations,
  updateReservationStatus,
};