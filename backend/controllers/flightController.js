// controllers/flightController.js
const duffelService     = require('../services/duffelService');
const FlightReservation = require('../models/flightReservationModel');
const pool              = require('../config/db');

// In-memory price overrides: { offer_id: overridden_price_tnd }
// For persistence across restarts, store in a DB table (e.g. flight_price_overrides)
const priceOverrides = {};

// ─────────────────────────────────────────────────────────────
// POST /api/flights/search
// ─────────────────────────────────────────────────────────────
const searchFlights = async (req, res) => {
  try {
    const { slices, passengers, cabin_class, max_connections } = req.body;

    if (!slices || !Array.isArray(slices) || slices.length === 0) {
      return res.status(400).json({ success: false, message: 'slices is required and must be a non-empty array.' });
    }
    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({ success: false, message: 'passengers is required and must be a non-empty array.' });
    }

    const result = await duffelService.searchFlights({
      slices, passengers,
      cabin_class:     cabin_class ?? 'economy',
      max_connections,
    });

    // Apply any active admin price overrides
    const offersWithOverrides = result.offers.map(offer => {
      if (priceOverrides[offer.id] !== undefined) {
        return {
          ...offer,
          total_amount:      String(priceOverrides[offer.id]),
          total_currency:    'TND',
          _price_overridden: true,
        };
      }
      return offer;
    });

    return res.status(200).json({
      success:          true,
      offer_request_id: result.id,
      offers:           offersWithOverrides,
    });
  } catch (err) {
    console.error('[flightController.searchFlights]', err?.errors ?? err.message);
    return res.status(500).json({ success: false, message: err?.errors?.[0]?.message ?? err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/flights/offer/:offerId
// ─────────────────────────────────────────────────────────────
const getOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const offer = await duffelService.getOffer(offerId);

    if (priceOverrides[offerId] !== undefined) {
      offer.total_amount      = String(priceOverrides[offerId]);
      offer.total_currency    = 'TND';
      offer._price_overridden = true;
    }

    return res.status(200).json({ success: true, offer });
  } catch (err) {
    console.error('[flightController.getOffer]', err?.errors ?? err.message);
    return res.status(500).json({ success: false, message: err?.errors?.[0]?.message ?? err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/flights/book
// ─────────────────────────────────────────────────────────────
const bookFlight = async (req, res) => {
  try {
    const { offer_id, passengers, payment_method = 'agency' } = req.body;
    const userId = req.user?.id;   // set by auth middleware if present, else undefined

    if (!offer_id)
      return res.status(400).json({ success: false, message: 'offer_id is required.' });
    if (!passengers || passengers.length === 0)
      return res.status(400).json({ success: false, message: 'passengers is required.' });

    // Fetch the normalised offer for original Duffel price
    const offer = await duffelService.getOffer(offer_id);

    // Always use the original Duffel price for the actual booking payment
    const paymentPayload = {
      type:     'balance',
      amount:   offer._original_amount,
      currency: offer._original_currency,
    };

    const order = await duffelService.bookFlight({ offer_id, passengers, payments: paymentPayload });

    // Use the displayed price (with override if any) for internal record-keeping
    const displayedPrice = priceOverrides[offer_id] !== undefined
      ? String(priceOverrides[offer_id])
      : offer.total_amount;

    const isOnline       = payment_method === 'online';
    const status         = isOnline ? 'confirmed' : 'pending';
    const payment_status = isOnline ? 'paid' : 'pending';

    const reservation = await FlightReservation.create({
      user_id:         userId || null,
      duffel_order_id: order.id,
      offer_id,
      total_price:     displayedPrice,
      currency:        'TND',
      passengers,
      status,
      payment_status,
    });

    return res.status(201).json({
      success:      true,
      message:      isOnline ? 'Booking confirmed and paid.' : 'Booking created. Payment pending.',
      reservation,
      duffel_order: order,
    });
  } catch (err) {
    console.error('[flightController.bookFlight]', err?.errors ?? err.message);
    return res.status(500).json({ success: false, message: err?.errors?.[0]?.message ?? err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/flights/reservations  (admin)
// ─────────────────────────────────────────────────────────────
const getReservations = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        fr.*,
        u.name  AS user_name,
        u.email AS user_email
      FROM public.flight_reservations fr
      LEFT JOIN public.users u ON u.id = fr.user_id
      ORDER BY fr.created_at DESC
    `);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[getReservations]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/flights/reservations/:id/status  (admin)
// ─────────────────────────────────────────────────────────────
const updateReservationStatus = async (req, res) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide.' });
    }

    const paymentStatus = status === 'confirmed' ? 'paid'
                        : status === 'cancelled' ? 'refunded'
                        : undefined;

    const query = paymentStatus
      ? `UPDATE public.flight_reservations SET status=$1, payment_status=$2, updated_at=NOW() WHERE id=$3 RETURNING *`
      : `UPDATE public.flight_reservations SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`;

    const params = paymentStatus ? [status, paymentStatus, id] : [status, id];
    const { rows } = await pool.query(query, params);

    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Réservation introuvable.' });

    return res.json({ success: true, reservation: rows[0] });
  } catch (err) {
    console.error('[updateReservationStatus]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/flights/price-override  (admin)
// Body: { offer_id: "off_...", overridden_price: 1250.00 }
// ─────────────────────────────────────────────────────────────
const setPriceOverride = async (req, res) => {
  try {
    const { offer_id, overridden_price } = req.body;

    if (!offer_id)
      return res.status(400).json({ success: false, message: 'offer_id is required.' });

    const price = parseFloat(overridden_price);
    if (isNaN(price) || price <= 0)
      return res.status(400).json({ success: false, message: 'overridden_price must be a positive number.' });

    priceOverrides[offer_id] = price;
    console.log(`[priceOverride] offer ${offer_id} → ${price} TND`);

    return res.status(200).json({
      success:          true,
      message:          `Prix de l'offre ${offer_id} mis à jour à ${price} TND.`,
      offer_id,
      overridden_price: price,
    });
  } catch (err) {
    console.error('[flightController.setPriceOverride]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/flights/price-override/:offerId  (admin)
// ─────────────────────────────────────────────────────────────
const deletePriceOverride = async (req, res) => {
  try {
    const { offerId } = req.params;
    if (priceOverrides[offerId] !== undefined) {
      delete priceOverrides[offerId];
      return res.status(200).json({ success: true, message: `Prix de l'offre ${offerId} réinitialisé.` });
    }
    return res.status(404).json({ success: false, message: 'Aucun override trouvé pour cette offre.' });
  } catch (err) {
    console.error('[flightController.deletePriceOverride]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/flights/price-overrides  (admin)
// ─────────────────────────────────────────────────────────────
const getPriceOverrides = async (req, res) => {
  return res.status(200).json({
    success:   true,
    overrides: priceOverrides,
    count:     Object.keys(priceOverrides).length,
  });
};

module.exports = {
  searchFlights,
  getOffer,
  bookFlight,
  getReservations,
  updateReservationStatus,
  setPriceOverride,
  deletePriceOverride,
  getPriceOverrides,
};