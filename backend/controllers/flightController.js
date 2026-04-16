// backend/controllers/flightController.js
const duffelService      = require('../services/duffelService');
const FlightReservation  = require('../models/flightReservationModel');
const { sendReservationStatusEmail } = require('../utils/mailer');

// In-memory price overrides: { offer_id: overridden_price_tnd }
const priceOverrides = {};

// ── E.164 phone normalizer ────────────────────────────────────────────────────
// Duffel requires +[country_code][number] with no spaces, dashes, or parentheses.
// This runs server-side as a safety net even when the frontend already normalizes.
const toE164 = (raw = '') => {
  let cleaned = String(raw).replace(/[\s\-().]/g, '');
  // Tunisian 8-digit local number → prepend +216
  if (/^[2345789]\d{7}$/.test(cleaned)) cleaned = '+216' + cleaned;
  if (!cleaned.startsWith('+'))          cleaned = '+' + cleaned;
  return cleaned;
};

const parsePassengers = (passengers) => {
  if (Array.isArray(passengers)) return passengers;
  try { return JSON.parse(passengers || '[]'); } catch { return []; }
};

// ── Search ────────────────────────────────────────────────────────────────────
const searchFlights = async (req, res) => {
  try {
    const { slices, passengers, cabin_class, max_connections } = req.body;

    if (!slices || !Array.isArray(slices) || slices.length === 0)
      return res.status(400).json({ success:false, message:'slices is required and must be a non-empty array.' });
    if (!passengers || !Array.isArray(passengers) || passengers.length === 0)
      return res.status(400).json({ success:false, message:'passengers is required and must be a non-empty array.' });

    const result = await duffelService.searchFlights({ slices, passengers, cabin_class: cabin_class ?? 'economy', max_connections });

    const offersWithOverrides = result.offers.map((offer) =>
      priceOverrides[offer.id] !== undefined
        ? { ...offer, total_amount:String(priceOverrides[offer.id]), total_currency:'TND', _price_overridden:true }
        : offer
    );

    return res.status(200).json({ success:true, offer_request_id:result.id, offers:offersWithOverrides });
  } catch (err) {
    console.error('[flightController.searchFlights]', err?.errors ?? err.message);
    return res.status(500).json({ success:false, message:err?.errors?.[0]?.message ?? err.message });
  }
};

// ── Get offer ─────────────────────────────────────────────────────────────────
const getOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const offer = await duffelService.getOffer(offerId);
    if (priceOverrides[offerId] !== undefined) {
      offer.total_amount   = String(priceOverrides[offerId]);
      offer.total_currency = 'TND';
      offer._price_overridden = true;
    }
    return res.status(200).json({ success:true, offer });
  } catch (err) {
    console.error('[flightController.getOffer]', err?.errors ?? err.message);
    return res.status(500).json({ success:false, message:err?.errors?.[0]?.message ?? err.message });
  }
};

// ── Book flight ───────────────────────────────────────────────────────────────
const bookFlight = async (req, res) => {
  try {
    const { offer_id, passengers, payment_method = 'agency' } = req.body;
    const userId = req.clientId || null;

    if (!offer_id)
      return res.status(400).json({ success:false, message:'offer_id is required.' });
    if (!passengers || passengers.length === 0)
      return res.status(400).json({ success:false, message:'passengers is required.' });

    // ── Normalize phone numbers to E.164 before touching Duffel ──────────────
    const normalizedPassengers = passengers.map((pax) => ({
      ...pax,
      phone_number: toE164(pax.phone_number || ''),
    }));

    const offer = await duffelService.getOffer(offer_id);
    const paymentPayload = {
      type:     'balance',
      amount:   offer._original_amount,
      currency: offer._original_currency,
    };

    const order = await duffelService.bookFlight({ offer_id, passengers:normalizedPassengers, payments:paymentPayload });

    const displayedPrice  = priceOverrides[offer_id] !== undefined
      ? String(priceOverrides[offer_id])
      : offer.total_amount;

    const isOnline        = payment_method === 'online';
    const status          = isOnline ? 'confirmed' : 'pending';
    const payment_status  = isOnline ? 'paid'      : 'pending';

    const firstSlice   = offer.slices?.[0];
    const firstSegment = firstSlice?.segments?.[0];
    const lastSegment  = firstSlice?.segments?.[firstSlice?.segments?.length - 1];
    const firstPax     = normalizedPassengers[0];

    const reservation = await FlightReservation.create({
      user_id:           userId,
      duffel_order_id:   order.id,
      offer_id,
      origin_iata:       firstSegment?.origin?.iata_code       || null,
      destination_iata:  lastSegment?.destination?.iata_code   || firstSegment?.destination?.iata_code || null,
      airline_name:      firstSegment?.marketing_carrier?.name || null,
      flight_number:     firstSegment?.marketing_carrier_flight_number || null,
      departing_at:      firstSegment?.departing_at            || null,
      arriving_at:       lastSegment?.arriving_at              || firstSegment?.arriving_at || null,
      cabin_class:       offer.cabin_class                     || 'economy',
      total_price:       displayedPrice,
      currency:          'TND',
      passengers:        normalizedPassengers,
      status,
      payment_status,
      payment_method,
      notes: firstPax?.email ? `Contact: ${firstPax.email}` : null,
    });

    return res.status(201).json({
      success:      true,
      message:      isOnline ? 'Booking confirmed and paid.' : 'Booking created. Payment pending.',
      reservation,
      duffel_order: order,
    });
  } catch (err) {
    console.error('[flightController.bookFlight]', err?.errors ?? err.message);
    return res.status(500).json({ success:false, message:err?.errors?.[0]?.message ?? err.message });
  }
};

// ── Get all reservations (admin) ──────────────────────────────────────────────
const getReservations = async (req, res) => {
  try {
    const rows = await FlightReservation.getAllForAdmin();
    return res.json({ success:true, data:rows });
  } catch (err) {
    console.error('[getReservations]', err.message);
    return res.status(500).json({ success:false, message:err.message });
  }
};

// ── Get my reservations (client) ──────────────────────────────────────────────
const getMyReservations = async (req, res) => {
  try {
    const rows = await FlightReservation.findByUserId(req.clientId);
    return res.json({ success:true, data:rows });
  } catch (err) {
    console.error('[getMyReservations]', err.message);
    return res.status(500).json({ success:false, message:err.message });
  }
};

// ── Update reservation status (admin) ─────────────────────────────────────────
const updateReservationStatus = async (req, res) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowed.includes(status))
      return res.status(400).json({ success:false, message:'Statut invalide.' });
    if (status === 'cancelled' && req.adminRole !== 'main')
      return res.status(403).json({ success:false, message:"Seul l'administrateur principal peut annuler." });

    const existing = await FlightReservation.findById(id);
    if (!existing)
      return res.status(404).json({ success:false, message:'Réservation introuvable.' });

    const paymentStatus = status === 'confirmed' ? 'paid' : status === 'cancelled' ? 'refunded' : undefined;
    const reservation   = await FlightReservation.updateStatus(id, status, paymentStatus);

    if (['confirmed', 'cancelled', 'completed'].includes(status)) {
      const parsedPax  = parsePassengers(reservation?.passengers);
      const firstPax   = parsedPax[0];
      const email      = existing.client_email || firstPax?.email;
      const firstName  = existing.client_first_name || firstPax?.given_name || 'Client';

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
            'Départ':    reservation.departing_at ? new Date(reservation.departing_at).toLocaleString('fr-FR') : null,
            'Cabine':    reservation.cabin_class,
            'Paiement':  reservation.payment_method === 'online' ? '💳 En ligne' : '🏪 Agence',
            'Total':     reservation.total_price ? `${Number(reservation.total_price).toLocaleString('fr-TN')} ${reservation.currency || 'TND'}` : null,
          },
        }).catch(err => console.error('❌ Flight status email failed:', err.message));
      }
    }

    return res.json({ success:true, reservation });
  } catch (err) {
    console.error('[updateReservationStatus]', err.message);
    return res.status(500).json({ success:false, message:err.message });
  }
};

// ── Price overrides ───────────────────────────────────────────────────────────
const setPriceOverride = async (req, res) => {
  try {
    const { offer_id, overridden_price } = req.body;
    if (!offer_id)
      return res.status(400).json({ success:false, message:'offer_id is required.' });
    const price = parseFloat(overridden_price);
    if (isNaN(price) || price <= 0)
      return res.status(400).json({ success:false, message:'overridden_price must be a positive number.' });
    priceOverrides[offer_id] = price;
    return res.status(200).json({ success:true, message:`Prix mis à jour à ${price} TND.`, offer_id, overridden_price:price });
  } catch (err) {
    console.error('[setPriceOverride]', err.message);
    return res.status(500).json({ success:false, message:err.message });
  }
};

const deletePriceOverride = async (req, res) => {
  try {
    const { offerId } = req.params;
    if (priceOverrides[offerId] !== undefined) {
      delete priceOverrides[offerId];
      return res.status(200).json({ success:true, message:`Prix de ${offerId} réinitialisé.` });
    }
    return res.status(404).json({ success:false, message:'Aucun override trouvé.' });
  } catch (err) {
    return res.status(500).json({ success:false, message:err.message });
  }
};

const getPriceOverrides = async (req, res) =>
  res.status(200).json({ success:true, overrides:priceOverrides, count:Object.keys(priceOverrides).length });

module.exports = {
  searchFlights, getOffer, bookFlight,
  getReservations, getMyReservations, updateReservationStatus,
  setPriceOverride, deletePriceOverride, getPriceOverrides,
};