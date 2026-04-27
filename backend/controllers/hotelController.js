// backend/controllers/hotelController.js
const model = require('../models/hotelModel');

// In-memory overrides (admin pricing page). Keyed by `hotel_code`.
const priceOverrides = {};

const getAll = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const publicOnly = req.query.public === 'true';
    const { city, sort, limit, page, search } = req.query;
    const data = await model.listHotels({ publicOnly, city, sort, limit, page, search });
    res.json({ success: true, hotels: data.hotels, total: data.total });
  } catch (err) {
    console.error('[hotels] getAll:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const getOne = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const publicOnly = req.query.public === 'true';
    const hotel = await model.getHotelById(req.params.id, { publicOnly });
    if (!hotel) return res.status(404).json({ success: false, message: 'Hôtel introuvable' });
    res.json({ success: true, data: hotel });
  } catch (err) {
    console.error('[hotels] getOne:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const create = async (req, res) => {
  try {
    const { name, city } = req.body;
    if (!name || !city) {
      return res.status(400).json({ success: false, message: 'Nom et ville obligatoires' });
    }
    const hotel = await model.createHotel(req.body);
    res.status(201).json({ success: true, data: hotel, message: 'Hôtel créé' });
  } catch (err) {
    console.error('[hotels] create:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const update = async (req, res) => {
  try {
    const hotel = await model.updateHotel(req.params.id, req.body);
    if (!hotel) return res.status(404).json({ success: false, message: 'Hôtel introuvable' });
    res.json({ success: true, data: hotel, message: 'Hôtel mis à jour' });
  } catch (err) {
    console.error('[hotels] update:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const remove = async (req, res) => {
  try {
    const deleted = await model.deleteHotel(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Hôtel introuvable' });
    res.json({ success: true, message: 'Hôtel supprimé' });
  } catch (err) {
    console.error('[hotels] remove:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Reservations ─────────────────────────────────────────────
const createReservation = async (req, res) => {
  try {
    const {
      hotel_id,
      hotel_name,
      destination_code,
      pension_code,
      pension_price,
      check_in,
      check_out,
      adults,
      children,
      rooms,
      rooms_pax,
      holder_first_name,
      holder_last_name,
      holder_email,
      holder_phone,
      total_price,
      currency,
      payment_method,
    } = req.body || {};

    if (!hotel_name || !check_in || !check_out) {
      return res.status(400).json({ success: false, message: 'hotel_name, check_in, check_out requis' });
    }
    const reservation = await model.createReservation({
      hotel_id,
      hotel_name,
      destination_code,
      pension_code,
      pension_price,
      check_in,
      check_out,
      adults,
      children,
      rooms,
      rooms_pax,
      holder_first_name,
      holder_last_name,
      holder_email,
      holder_phone,
      total_price,
      currency,
      payment_method,
    });

    res.status(201).json({ success: true, data: reservation, message: 'Réservation créée' });
  } catch (err) {
    console.error('[hotels] createReservation:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const getReservations = async (req, res) => {
  try {
    const data = await model.listReservations();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[hotels] getReservations:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body || {};
    const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }
    if (status === 'cancelled' && req.adminRole !== 'main') {
      return res.status(403).json({ success: false, message: "Réservé à l'administrateur principal" });
    }

    const r = await model.updateReservationStatus(req.params.id, status);
    if (!r) return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    res.json({ success: true, data: r, message: 'Statut mis à jour' });
  } catch (err) {
    console.error('[hotels] updateReservationStatus:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Admin pricing (legacy page) ───────────────────────────────
const search = async (req, res) => {
  try {
    // For now: return DB hotels (active + inactive) and compute a "total_amount"
    // as the lowest pension price, with +10% default margin.
    const { hotels } = await model.listHotels({ publicOnly: false, limit: 60, page: 1 });
    const computed = hotels.map((h) => {
      const opts = Array.isArray(h.price_options) ? h.price_options : [];
      const min = opts.reduce((acc, o) => {
        const v = parseFloat(o?.value);
        return Number.isFinite(v) ? Math.min(acc, v) : acc;
      }, Infinity);
      const base = Number.isFinite(min) ? min : 0;
      const code = h.code || `H-${h.id}`;
      const displayed = priceOverrides[code] !== undefined ? priceOverrides[code] : base * 1.1;
      return {
        code,
        name: h.name,
        city: h.city,
        destination_name: h.city,
        stars: h.stars,
        total_amount: String(displayed.toFixed(2)),
        _original_amount: String(base.toFixed(2)),
        _original_currency: 'TND',
      };
    });

    res.json({ success: true, hotels: computed });
  } catch (err) {
    console.error('[hotels] search:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const setPriceOverride = async (req, res) => {
  try {
    const { hotel_code, overridden_price } = req.body || {};
    if (!hotel_code) return res.status(400).json({ success: false, message: 'hotel_code requis' });
    const p = parseFloat(overridden_price);
    if (!Number.isFinite(p) || p <= 0) {
      return res.status(400).json({ success: false, message: 'overridden_price invalide' });
    }
    priceOverrides[hotel_code] = p;
    res.json({ success: true, hotel_code, overridden_price: p });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const deletePriceOverride = async (req, res) => {
  const { hotelCode } = req.params;
  if (priceOverrides[hotelCode] !== undefined) {
    delete priceOverrides[hotelCode];
    return res.json({ success: true });
  }
  return res.status(404).json({ success: false, message: 'Aucun override trouvé' });
};

const getPriceOverrides = async (req, res) =>
  res.json({ success: true, overrides: priceOverrides, count: Object.keys(priceOverrides).length });

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove,
  createReservation,
  getReservations,
  updateReservationStatus,
  search,
  setPriceOverride,
  deletePriceOverride,
  getPriceOverrides,
};

