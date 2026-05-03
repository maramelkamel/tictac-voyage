const HotelModel = require('../models/hotelModel');
const HotelReservationModel = require('../models/hotelReservationModel');
const { sendAgencyReservationEmail, sendReservationStatusEmail } = require('../utils/mailer');

const DEFAULT_HOTEL_COVERS = {
  hero: {
    bg_image: '',
    tag: 'Hotels en Tunisie',
    title: 'Trouvez votre',
    title_accent: 'hotel ideal',
    sub: 'Des adresses choisies avec soin, des promotions actives et un parcours de reservation identique a vos voyages organises.',
  },
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getPublicHotels = async (req, res) => {
  try {
    const hotels = await HotelModel.getPublicHotels({
      city: req.query.city,
      search: req.query.search,
      sortBy: req.query.sortBy,
      featuredOnly: req.query.featured === 'true',
    });
    return res.json({ success: true, data: hotels });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getPopularHotels = async (req, res) => {
  try {
    const hotels = await HotelModel.getPopularHotels(toNumber(req.query.limit, 4));
    return res.json({ success: true, data: hotels });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getHotelById = async (req, res) => {
  try {
    const hotel = await HotelModel.getById(req.params.id);
    if (!hotel || hotel.is_active === false) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }
    return res.json({ success: true, data: hotel });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getHotelCovers = async (req, res) => {
  try {
    const covers = await HotelModel.getSetting('hotel-covers');
    return res.json({ success: true, data: covers || DEFAULT_HOTEL_COVERS });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load hotel page settings.' });
  }
};

const updateHotelCovers = async (req, res) => {
  try {
    if (!req.body?.hero) {
      return res.status(400).json({ success: false, message: 'Hero data is required.' });
    }

    const saved = await HotelModel.setSetting('hotel-covers', { hero: req.body.hero });
    return res.json({ success: true, data: saved, message: 'Hotel page appearance updated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to update hotel page settings.' });
  }
};

const getAdminHotels = async (req, res) => {
  try {
    const hotels = await HotelModel.getAdminHotels({
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
    const hotel = await HotelModel.create(req.body);
    return res.status(201).json({ success: true, hotel });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateHotel = async (req, res) => {
  try {
    const hotel = await HotelModel.update(req.params.id, req.body);
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
      promo_code = null,
      applied_promotion = null,
      display_total = null,
    } = req.body;

    if (!hotel?.name || !hotel?.id) {
      return res.status(400).json({ success: false, message: 'Hotel data is required.' });
    }

    if (!reservation?.holder_first_name || !reservation?.holder_last_name || !reservation?.holder_email || !reservation?.holder_phone) {
      return res.status(400).json({ success: false, message: 'Reservation holder information is required.' });
    }

    const selectedHotel = await HotelModel.getById(hotel.id);
    if (!selectedHotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }

    const requestedRooms = toNumber(reservation.rooms, 1);
    if (selectedHotel.available_rooms < requestedRooms) {
      return res.status(400).json({
        success: false,
        message: `Only ${selectedHotel.available_rooms} room(s) remain available for this hotel.`,
      });
    }

    const isOnline = payment_method === 'online';
    const finalTotal = Number.isFinite(Number(display_total))
      ? toNumber(display_total, 0)
      : toNumber(selectedHotel.base_price, 0);

    const saved = await HotelReservationModel.create({
      user_id: req.clientId || null,
      hotel_id: selectedHotel.id,
      hotel_name: selectedHotel.name,
      hotel_city: selectedHotel.city || reservation.city || 'Tunisia',
      hotel_location: selectedHotel.address || reservation.city || 'Tunisia',
      check_in: reservation.check_in,
      check_out: reservation.check_out,
      adults: toNumber(reservation.adults, 2),
      rooms: requestedRooms,
      total_price: finalTotal,
      currency: selectedHotel.currency || 'TND',
      promo_code,
      applied_promotion,
      payment_method,
      status: isOnline ? 'confirmed' : 'pending',
      payment_status: isOnline ? 'paid' : 'pending',
      holder_first_name: reservation.holder_first_name,
      holder_last_name: reservation.holder_last_name,
      holder_email: reservation.holder_email,
      holder_phone: reservation.holder_phone,
      special_requests: reservation.special_requests || null,
      selected_hotel: {
        ...selectedHotel,
        applied_promotion: applied_promotion || null,
      },
    });

    const emailDetails = {
      Ville: saved.hotel_city,
      'Check-in': saved.check_in,
      'Check-out': saved.check_out,
      Voyageurs: `${saved.adults} adulte(s)`,
      Chambres: `${saved.rooms}`,
      Paiement: isOnline ? 'En ligne' : "A l'agence",
      Total: `${Number(saved.total_price).toLocaleString('fr-FR')} ${saved.currency}`,
      'Code promo': promo_code || applied_promotion?.code_promo || null,
    };

    if (isOnline) {
      await sendReservationStatusEmail({
        email: reservation.holder_email,
        firstName: reservation.holder_first_name,
        type: 'hotel',
        title: selectedHotel.name,
        status: saved.status,
        details: emailDetails,
      }).catch((error) => console.error('Hotel reservation email failed:', error.message));
    } else {
      await sendAgencyReservationEmail({
        email: reservation.holder_email,
        firstName: reservation.holder_first_name,
        type: 'hotel',
        title: selectedHotel.name,
        details: emailDetails,
        promotionReminder: applied_promotion?.date_fin ? {
          code: applied_promotion.code_promo,
          date_fin: applied_promotion.date_fin,
        } : null,
      }).catch((error) => console.error('Hotel agency email failed:', error.message));
    }

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
  getPublicHotels,
  getPopularHotels,
  getHotelById,
  getHotelCovers,
  updateHotelCovers,
  getAdminHotels,
  createHotel,
  updateHotel,
  deleteHotel,
  bookHotel,
  getMyReservations,
  getReservations,
  updateReservationStatus,
};
