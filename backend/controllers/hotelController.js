// controllers/hotelController.js
const hotelbedsService = require('../services/hotelbedsService');
const pool             = require('../config/db');

// In-memory price overrides: { "hotelCode_rateKey": overridden_price_tnd }
const priceOverrides = {};

// ─────────────────────────────────────────────────────────────
// POST /api/hotels/search
// Body: { destination, check_in, check_out, adults, children, rooms, stars_filter }
// ─────────────────────────────────────────────────────────────
const searchHotels = async (req, res) => {
  try {
    const { destination, check_in, check_out, adults, children, rooms, stars_filter } = req.body;

    if (!destination)
      return res.status(400).json({ success: false, message: 'destination is required.' });
    if (!check_in || !check_out)
      return res.status(400).json({ success: false, message: 'check_in and check_out are required.' });

    const result = await hotelbedsService.searchHotels({
      destination, check_in, check_out,
      adults:      adults   ?? 1,
      children:    children ?? 0,
      rooms:       rooms    ?? 1,
      stars_filter,
    });

    // Apply any active price overrides
    const hotelsWithOverrides = result.hotels.map(hotel => {
      const key = hotel.code;
      if (priceOverrides[key] !== undefined) {
        return { ...hotel, total_amount: String(priceOverrides[key]), _price_overridden: true };
      }
      return hotel;
    });

    return res.status(200).json({
      success:  true,
      check_in:  result.check_in,
      check_out: result.check_out,
      adults:    result.adults,
      children:  result.children,
      total:     result.total,
      hotels:    hotelsWithOverrides,
    });
  } catch (err) {
    console.error('[hotelController.searchHotels]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/hotels/details/:hotelCode
// ─────────────────────────────────────────────────────────────
const getHotelDetails = async (req, res) => {
  try {
    const { hotelCode } = req.params;
    const hotel = await hotelbedsService.getHotelDetails(hotelCode);

    const key = hotel.code;
    if (priceOverrides[key] !== undefined) {
      hotel.total_amount    = String(priceOverrides[key]);
      hotel._price_overridden = true;
    }

    return res.status(200).json({ success: true, hotel });
  } catch (err) {
    console.error('[hotelController.getHotelDetails]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/hotels/book
// Body: { rate_key, holder, rooms_pax, payment_method, hotel_info }
// ─────────────────────────────────────────────────────────────
const bookHotel = async (req, res) => {
  try {
    const {
      rate_key, holder, rooms_pax,
      payment_method = 'agency',
      hotel_info,
    } = req.body;

    const userId = req.user?.id || null;

    if (!rate_key)
      return res.status(400).json({ success: false, message: 'rate_key is required.' });
    if (!holder || !holder.first_name || !holder.last_name)
      return res.status(400).json({ success: false, message: 'holder (first_name, last_name) is required.' });
    if (!rooms_pax || rooms_pax.length === 0)
      return res.status(400).json({ success: false, message: 'rooms_pax is required.' });

    const booking = await hotelbedsService.bookHotel({
      rate_key,
      holder,
      rooms_pax,
      client_reference: `TICTAC-${Date.now()}`,
    });

    const isOnline       = payment_method === 'online';
    const status         = isOnline ? 'confirmed' : 'pending';
    const payment_status = isOnline ? 'paid' : 'pending';

    // Use override price if set, else hotel_info price
    const hotelKey     = hotel_info?.code;
    const displayPrice = hotelKey && priceOverrides[hotelKey] !== undefined
      ? String(priceOverrides[hotelKey])
      : hotel_info?.total_amount || booking.total_amount || '0';

    // Store reservation in DB
    const { rows } = await pool.query(`
      INSERT INTO public.hotel_reservations (
        user_id, hotelbeds_reference, rate_key,
        hotel_code, hotel_name, destination_code,
        check_in, check_out, adults, children,
        total_price, currency,
        holder_first_name, holder_last_name,
        holder_email, holder_phone,
        rooms_pax, status, payment_status
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19
      ) RETURNING *
    `, [
      userId,
      booking.reference,
      rate_key,
      hotel_info?.code        || '',
      hotel_info?.name        || '',
      hotel_info?.destination_code || '',
      hotel_info?.check_in    || '',
      hotel_info?.check_out   || '',
      hotel_info?.adults      || 1,
      hotel_info?.children    || 0,
      displayPrice,
      'TND',
      holder.first_name,
      holder.last_name,
      holder.email  || '',
      holder.phone  || '',
      JSON.stringify(rooms_pax),
      status,
      payment_status,
    ]);

    return res.status(201).json({
      success:      true,
      message:      isOnline ? 'Réservation confirmée et payée.' : 'Réservation créée. Paiement en attente.',
      reservation:  rows[0],
      booking,
    });
  } catch (err) {
    console.error('[hotelController.bookHotel]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/hotels/reservations  (admin)
// ─────────────────────────────────────────────────────────────
const getReservations = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        hr.*,
        u.name  AS user_name,
        u.email AS user_email
      FROM public.hotel_reservations hr
      LEFT JOIN public.users u ON u.id = hr.user_id
      ORDER BY hr.created_at DESC
    `);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[hotelController.getReservations]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/hotels/reservations/:id/status  (admin)
// ─────────────────────────────────────────────────────────────
const updateReservationStatus = async (req, res) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: 'Statut invalide.' });

    const paymentStatus = status === 'confirmed' ? 'paid'
                        : status === 'cancelled' ? 'refunded'
                        : undefined;

    const query = paymentStatus
      ? `UPDATE public.hotel_reservations SET status=$1, payment_status=$2, updated_at=NOW() WHERE id=$3 RETURNING *`
      : `UPDATE public.hotel_reservations SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`;

    const params = paymentStatus ? [status, paymentStatus, id] : [status, id];
    const { rows } = await pool.query(query, params);

    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Réservation introuvable.' });

    return res.json({ success: true, reservation: rows[0] });
  } catch (err) {
    console.error('[hotelController.updateReservationStatus]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/hotels/price-override  (admin)
// Body: { hotel_code, overridden_price }
// ─────────────────────────────────────────────────────────────
const setPriceOverride = async (req, res) => {
  try {
    const { hotel_code, overridden_price } = req.body;
    if (!hotel_code)
      return res.status(400).json({ success: false, message: 'hotel_code is required.' });

    const price = parseFloat(overridden_price);
    if (isNaN(price) || price <= 0)
      return res.status(400).json({ success: false, message: 'overridden_price must be a positive number.' });

    priceOverrides[hotel_code] = price;
    console.log(`[hotelPriceOverride] hotel ${hotel_code} → ${price} TND`);

    return res.status(200).json({ success: true, hotel_code, overridden_price: price });
  } catch (err) {
    console.error('[hotelController.setPriceOverride]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/hotels/price-override/:hotelCode  (admin)
// ─────────────────────────────────────────────────────────────
const deletePriceOverride = async (req, res) => {
  try {
    const { hotelCode } = req.params;
    if (priceOverrides[hotelCode] !== undefined) {
      delete priceOverrides[hotelCode];
      return res.status(200).json({ success: true, message: `Prix de l'hôtel ${hotelCode} réinitialisé.` });
    }
    return res.status(404).json({ success: false, message: 'Aucun override trouvé.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/hotels/price-overrides  (admin)
// ─────────────────────────────────────────────────────────────
const getPriceOverrides = async (req, res) => {
  return res.status(200).json({
    success:   true,
    overrides: priceOverrides,
    count:     Object.keys(priceOverrides).length,
  });
};

// ─────────────────────────────────────────────────────────────
// GET /api/hotels/destinations  (public)
// ─────────────────────────────────────────────────────────────
const getDestinations = async (req, res) => {
  try {
    const { country } = req.query;
    const destinations = await hotelbedsService.getDestinations(country || 'TN');
    return res.json({ success: true, destinations });
  } catch (err) {
    console.error('[hotelController.getDestinations]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  searchHotels,
  getHotelDetails,
  bookHotel,
  getReservations,
  updateReservationStatus,
  setPriceOverride,
  deletePriceOverride,
  getPriceOverrides,
  getDestinations,
};