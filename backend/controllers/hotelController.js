const HotelModel = require('../models/hotelModel');
const HotelReservationModel = require('../models/hotelReservationModel');
const hotelService = require('../services/hotelService');
const { sendReservationStatusEmail } = require('../utils/mailer');

const DEFAULT_AMENITIES = ['WiFi', 'Pool', 'Breakfast', 'Parking'];

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getCityId = async (req, res) => {
  try {
    const city = req.query.city || 'Tunis';
    const result = await hotelService.getCityId(city);
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMakCorpsHotels = async (req, res) => {
  try {
    const {
      cityId,
      page = 0,
      currency = 'USD',
      rooms = 1,
      adults = 2,
      checkin,
      checkout,
    } = req.query;

    if (!cityId) {
      return res.status(400).json({ success: false, message: 'cityId is required.' });
    }

    const result = await hotelService.getHotelsFromMakCorps({
      cityId,
      page: toNumber(page, 0),
      currency,
      rooms: toNumber(rooms, 1),
      adults: toNumber(adults, 2),
      checkin,
      checkout,
    });

    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getBookingHotels = async (req, res) => {
  try {
    const {
      city = 'Tunis',
      bbox,
      page = 1,
      pageSize = 10,
      checkin,
      checkout,
      adults = 2,
      rooms = 1,
      currency = 'USD',
    } = req.query;

    const result = await hotelService.getHotelsFromBookingAPI({
      city,
      bbox,
      page: toNumber(page, 1),
      pageSize: toNumber(pageSize, 10),
      checkin,
      checkout,
      adults: toNumber(adults, 2),
      rooms: toNumber(rooms, 1),
      currency,
    });

    return res.json({ success: true, bbox: bbox || hotelService.getCityBbox(city), ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getManualHotels = async (req, res) => {
  try {
    const hotels = await HotelModel.getAll({
      city: req.query.city,
      search: req.query.search,
    });
    return res.json({ success: true, hotels });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminHotels = async (req, res) => {
  try {
    const hotels = await HotelModel.getAll({
      city: req.query.city,
      search: req.query.search,
    });
    return res.json({ success: true, hotels });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createHotel = async (req, res) => {
  try {
    const hotel = await HotelModel.create({
      name: req.body.name,
      city: req.body.city,
      address: req.body.address,
      description: req.body.description,
      image_url: req.body.image_url,
      rating: req.body.rating,
      amenities: req.body.amenities?.length ? req.body.amenities : DEFAULT_AMENITIES,
      base_price: req.body.base_price,
      currency: req.body.currency || 'USD',
      availability: req.body.availability || 'Available',
    });

    return res.status(201).json({ success: true, hotel });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateHotel = async (req, res) => {
  try {
    const hotel = await HotelModel.update(req.params.id, {
      name: req.body.name,
      city: req.body.city,
      address: req.body.address,
      description: req.body.description,
      image_url: req.body.image_url,
      rating: req.body.rating,
      amenities: req.body.amenities?.length ? req.body.amenities : DEFAULT_AMENITIES,
      base_price: req.body.base_price,
      currency: req.body.currency || 'USD',
      availability: req.body.availability || 'Available',
      is_active: req.body.is_active ?? true,
    });

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }

    return res.json({ success: true, hotel });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteHotel = async (req, res) => {
  try {
    const deleted = await HotelModel.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const bookHotel = async (req, res) => {
  try {
    const {
      hotel,
      reservation,
      payment_method = 'agency',
    } = req.body;

    if (!hotel?.name) {
      return res.status(400).json({ success: false, message: 'Hotel data is required.' });
    }

    if (!reservation?.holder_first_name || !reservation?.holder_last_name || !reservation?.holder_email || !reservation?.holder_phone) {
      return res.status(400).json({ success: false, message: 'Reservation holder information is required.' });
    }

    const isOnline = payment_method === 'online';
    const saved = await HotelReservationModel.create({
      user_id: req.clientId || null,
      hotel_id: hotel.manual_id || null,
      hotel_name: hotel.name,
      hotel_city: hotel.city || reservation.city || 'Tunisia',
      hotel_location: hotel.location || reservation.city || 'Tunisia',
      check_in: reservation.check_in,
      check_out: reservation.check_out,
      adults: toNumber(reservation.adults, 2),
      rooms: toNumber(reservation.rooms, 1),
      total_price: toNumber(hotel.price_numeric, 0),
      currency: hotel.currency || 'USD',
      payment_method,
      status: isOnline ? 'confirmed' : 'pending',
      payment_status: isOnline ? 'paid' : 'pending',
      holder_first_name: reservation.holder_first_name,
      holder_last_name: reservation.holder_last_name,
      holder_email: reservation.holder_email,
      holder_phone: reservation.holder_phone,
      special_requests: reservation.special_requests || null,
      selected_hotel: hotel,
    });

    await sendReservationStatusEmail({
      email: reservation.holder_email,
      firstName: reservation.holder_first_name,
      type: 'hotel',
      title: hotel.name,
      status: saved.status,
      details: {
        Ville: saved.hotel_city,
        'Check-in': saved.check_in,
        'Check-out': saved.check_out,
        Voyageurs: `${saved.adults} adulte(s)`,
        Chambres: `${saved.rooms}`,
        Paiement: isOnline ? 'En ligne' : "A l'agence",
        Total: `${Number(saved.total_price).toLocaleString('fr-FR')} ${saved.currency}`,
      },
    }).catch((error) => console.error('Hotel reservation email failed:', error.message));

    return res.status(201).json({
      success: true,
      reservation: saved,
      message: isOnline
        ? 'Hotel booking confirmed and paid.'
        : 'Hotel booking created. Payment pending.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMyReservations = async (req, res) => {
  try {
    const data = await HotelReservationModel.findByUserId(req.clientId);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getReservations = async (req, res) => {
  try {
    const data = await HotelReservationModel.getAllForAdmin();
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    if (status === 'cancelled' && req.adminRole !== 'main') {
      return res.status(403).json({
        success: false,
        message: 'Only the main admin can cancel hotel reservations.',
      });
    }

    const existing = await HotelReservationModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    const paymentStatus = status === 'confirmed'
      ? 'paid'
      : status === 'cancelled'
        ? 'refunded'
        : undefined;

    const reservation = await HotelReservationModel.updateStatus(req.params.id, status, paymentStatus);

    await sendReservationStatusEmail({
      email: existing.client_email || existing.holder_email,
      firstName: existing.client_first_name || existing.holder_first_name,
      type: 'hotel',
      title: existing.hotel_name,
      status,
      details: {
        Ville: existing.hotel_city,
        'Check-in': existing.check_in,
        'Check-out': existing.check_out,
        Paiement: reservation.payment_method === 'online' ? 'En ligne' : "A l'agence",
        Total: `${Number(existing.total_price).toLocaleString('fr-FR')} ${existing.currency}`,
      },
    }).catch((error) => console.error('Hotel status email failed:', error.message));

    return res.json({ success: true, reservation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCityId,
  getMakCorpsHotels,
  getBookingHotels,
  getManualHotels,
  getAdminHotels,
  createHotel,
  updateHotel,
  deleteHotel,
  bookHotel,
  getMyReservations,
  getReservations,
  updateReservationStatus,
};
