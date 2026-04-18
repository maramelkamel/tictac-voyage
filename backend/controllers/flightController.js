// backend/controllers/flightController.js
const duffelService      = require('../services/duffelService');
const FlightReservation  = require('../models/flightReservationModel');
const { sendReservationStatusEmail } = require('../utils/mailer');

const priceOverrides = {};

// ── E.164 normalizer ─────────────────────────────────────────────
const toE164 = (raw = '') => {
  let s = String(raw).replace(/[\s\-().]/g, '');
  if (/^[2345789]\d{7}$/.test(s)) s = '+216' + s;
  if (!s.startsWith('+'))          s = '+' + s;
  return s;
};

// ── Detect if a Duffel error is an offer-expiry / availability error ──
const isOfferExpiredError = (err) => {
  const msg = (err?.errors?.[0]?.message || err?.message || '').toLowerCase();
  return (
    msg.includes('select another offer') ||
    msg.includes('no longer available') ||
    msg.includes('offer has expired') ||
    msg.includes('offer is expired') ||
    msg.includes('availability') ||
    msg.includes('expired')
  );
};

const parsePassengers = (passengers) => {
  if (Array.isArray(passengers)) return passengers;
  try { return JSON.parse(passengers || '[]'); } catch { return []; }
};

// ── Search ────────────────────────────────────────────────────────
const searchFlights = async (req, res) => {
  try {
    const { slices, passengers, cabin_class, max_connections } = req.body;
    if (!slices?.length)      return res.status(400).json({ success:false, message:'slices is required.' });
    if (!passengers?.length)  return res.status(400).json({ success:false, message:'passengers is required.' });

    const result = await duffelService.searchFlights({ slices, passengers, cabin_class:cabin_class??'economy', max_connections });

    const offers = result.offers.map(o =>
      priceOverrides[o.id] !== undefined
        ? { ...o, total_amount:String(priceOverrides[o.id]), total_currency:'TND', _price_overridden:true }
        : o
    );
    return res.json({ success:true, offer_request_id:result.id, offers });
  } catch (err) {
    console.error('[searchFlights]', err?.errors ?? err.message);
    return res.status(500).json({ success:false, message:err?.errors?.[0]?.message ?? err.message });
  }
};

// ── Get offer ─────────────────────────────────────────────────────
const getOffer = async (req, res) => {
  try {
    const offer = await duffelService.getOffer(req.params.offerId);
    if (priceOverrides[offer.id] !== undefined) {
      offer.total_amount = String(priceOverrides[offer.id]);
      offer.total_currency = 'TND';
      offer._price_overridden = true;
    }
    return res.json({ success:true, offer });
  } catch (err) {
    console.error('[getOffer]', err?.errors ?? err.message);
    if (isOfferExpiredError(err)) {
      return res.status(410).json({
        success:   false,
        expired:   true,
        message:   'Cette offre n\'est plus disponible. Veuillez effectuer une nouvelle recherche.',
      });
    }
    return res.status(500).json({ success:false, message:err?.errors?.[0]?.message ?? err.message });
  }
};

// ── Book flight ───────────────────────────────────────────────────
const bookFlight = async (req, res) => {
  try {
    const { offer_id, passengers, payment_method = 'agency' } = req.body;
    const userId = req.clientId || null;

    if (!offer_id)          return res.status(400).json({ success:false, message:'offer_id is required.' });
    if (!passengers?.length) return res.status(400).json({ success:false, message:'passengers is required.' });

    // Normalize phones server-side (safety net)
    const normalizedPassengers = passengers.map(p => ({
      ...p,
      phone_number: toE164(p.phone_number || ''),
    }));

    // Fetch fresh offer (validates it's still live)
    let offer;
    try {
      offer = await duffelService.getOffer(offer_id);
    } catch (err) {
      if (isOfferExpiredError(err)) {
        return res.status(410).json({
          success: false,
          expired: true,
          message: 'Cette offre a expiré. Veuillez effectuer une nouvelle recherche pour voir les derniers tarifs.',
        });
      }
      throw err;
    }

    const paymentPayload = {
      type:     'balance',
      amount:   offer._original_amount,
      currency: offer._original_currency,
    };

    let order;
    try {
      order = await duffelService.bookFlight({ offer_id, passengers:normalizedPassengers, payments:paymentPayload });
    } catch (err) {
      if (isOfferExpiredError(err)) {
        return res.status(410).json({
          success: false,
          expired: true,
          message: 'Les disponibilités ont changé pendant votre réservation. Veuillez sélectionner une nouvelle offre.',
        });
      }
      throw err;
    }

    const displayedPrice  = priceOverrides[offer_id] !== undefined ? String(priceOverrides[offer_id]) : offer.total_amount;
    const isOnline        = payment_method === 'online';
    const firstSlice      = offer.slices?.[0];
    const firstSegment    = firstSlice?.segments?.[0];
    const lastSegment     = firstSlice?.segments?.[firstSlice?.segments?.length - 1];
    const firstPax        = normalizedPassengers[0];

    const reservation = await FlightReservation.create({
      user_id:          userId,
      duffel_order_id:  order.id,
      offer_id,
      origin_iata:      firstSegment?.origin?.iata_code       || null,
      destination_iata: lastSegment?.destination?.iata_code   || firstSegment?.destination?.iata_code || null,
      airline_name:     firstSegment?.marketing_carrier?.name || null,
      flight_number:    firstSegment?.marketing_carrier_flight_number || null,
      departing_at:     firstSegment?.departing_at            || null,
      arriving_at:      lastSegment?.arriving_at              || firstSegment?.arriving_at || null,
      cabin_class:      offer.cabin_class                     || 'economy',
      total_price:      displayedPrice,
      currency:         'TND',
      passengers:       normalizedPassengers,
      status:           isOnline ? 'confirmed' : 'pending',
      payment_status:   isOnline ? 'paid'      : 'pending',
      payment_method,
      notes:            firstPax?.email ? `Contact: ${firstPax.email}` : null,
    });

    return res.status(201).json({
      success:      true,
      message:      isOnline ? 'Réservation confirmée et payée.' : 'Réservation créée. Paiement en attente.',
      reservation,
      duffel_order: order,
    });
  } catch (err) {
    console.error('[bookFlight]', err?.errors ?? err.message);
    return res.status(500).json({ success:false, message:err?.errors?.[0]?.message ?? err.message });
  }
};

// ── Admin: all reservations ───────────────────────────────────────
const getReservations = async (req, res) => {
  try {
    return res.json({ success:true, data: await FlightReservation.getAllForAdmin() });
  } catch (err) {
    return res.status(500).json({ success:false, message:err.message });
  }
};

// ── Client: my reservations ───────────────────────────────────────
const getMyReservations = async (req, res) => {
  try {
    return res.json({ success:true, data: await FlightReservation.findByUserId(req.clientId) });
  } catch (err) {
    return res.status(500).json({ success:false, message:err.message });
  }
};

// ── Admin: update status ──────────────────────────────────────────
const updateReservationStatus = async (req, res) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;
    const allowed    = ['pending','confirmed','cancelled','completed'];

    if (!allowed.includes(status))
      return res.status(400).json({ success:false, message:'Statut invalide.' });
    if (status === 'cancelled' && req.adminRole !== 'main')
      return res.status(403).json({ success:false, message:"Seul l'administrateur principal peut annuler." });

    const existing = await FlightReservation.findById(id);
    if (!existing) return res.status(404).json({ success:false, message:'Réservation introuvable.' });

    const paymentStatus = status==='confirmed' ? 'paid' : status==='cancelled' ? 'refunded' : undefined;
    const reservation   = await FlightReservation.updateStatus(id, status, paymentStatus);

    if (['confirmed','cancelled','completed'].includes(status)) {
      const parsedPax  = parsePassengers(reservation?.passengers);
      const email      = existing.client_email || parsedPax[0]?.email;
      const firstName  = existing.client_first_name || parsedPax[0]?.given_name || 'Client';
      if (email) {
        sendReservationStatusEmail({
          email, firstName,
          type:   'flight',
          title:  `${reservation.origin_iata||'?'} → ${reservation.destination_iata||'?'}`,
          status,
          details: {
            'Compagnie': reservation.airline_name,
            'Vol':       reservation.flight_number,
            'Départ':    reservation.departing_at ? new Date(reservation.departing_at).toLocaleString('fr-FR') : null,
            'Cabine':    reservation.cabin_class,
            'Paiement':  reservation.payment_method==='online' ? '💳 En ligne' : '🏪 Agence',
            'Total':     reservation.total_price ? `${Number(reservation.total_price).toLocaleString('fr-TN')} ${reservation.currency||'TND'}` : null,
          },
        }).catch(e => console.error('❌ Flight email failed:', e.message));
      }
    }
    return res.json({ success:true, reservation });
  } catch (err) {
    return res.status(500).json({ success:false, message:err.message });
  }
};

// ── Price overrides ───────────────────────────────────────────────
const setPriceOverride = async (req, res) => {
  try {
    const { offer_id, overridden_price } = req.body;
    if (!offer_id) return res.status(400).json({ success:false, message:'offer_id is required.' });
    const price = parseFloat(overridden_price);
    if (isNaN(price) || price <= 0) return res.status(400).json({ success:false, message:'overridden_price doit être positif.' });
    priceOverrides[offer_id] = price;
    return res.json({ success:true, message:`Prix mis à jour à ${price} TND.`, offer_id, overridden_price:price });
  } catch (err) {
    return res.status(500).json({ success:false, message:err.message });
  }
};

const deletePriceOverride = async (req, res) => {
  const { offerId } = req.params;
  if (priceOverrides[offerId] !== undefined) {
    delete priceOverrides[offerId];
    return res.json({ success:true });
  }
  return res.status(404).json({ success:false, message:'Aucun override trouvé.' });
};

const getPriceOverrides = async (req, res) =>
  res.json({ success:true, overrides:priceOverrides, count:Object.keys(priceOverrides).length });

module.exports = {
  searchFlights, getOffer, bookFlight,
  getReservations, getMyReservations, updateReservationStatus,
  setPriceOverride, deletePriceOverride, getPriceOverrides,
};