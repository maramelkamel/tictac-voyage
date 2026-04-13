// services/hotelbedsService.js
require('dotenv').config();
const crypto = require('crypto');

// ── Hotelbeds credentials ─────────────────────────────────────
const API_KEY    = process.env.HOTELBEDS_API_KEY    || '';
const API_SECRET = process.env.HOTELBEDS_API_SECRET || '';
const BASE_URL   = process.env.HOTELBEDS_BASE_URL   || 'https://api.test.hotelbeds.com';

// ── Currency conversion TND ───────────────────────────────────
const EUR_TO_TND = parseFloat(process.env.EUR_TO_TND_RATE || '3.38');
const MARGIN     = 1.10; // 10% agency margin

/**
 * Build X-Signature: SHA256(apiKey + secret + unixTimestamp)
 */
const buildSignature = () => {
  const ts  = Math.floor(Date.now() / 1000).toString();
  const raw = `${API_KEY}${API_SECRET}${ts}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
};

/**
 * Common headers for every Hotelbeds request
 */
const headers = () => ({
  'Api-key':     API_KEY,
  'X-Signature': buildSignature(),
  'Accept':      'application/json',
  'Accept-Encoding': 'gzip',
  'Content-Type':    'application/json',
});

/**
 * Convert amount to TND with agency margin
 */
const toTND = (amount, currency = 'EUR') => {
  const raw = parseFloat(amount || '0');
  let tnd;
  switch ((currency || 'EUR').toUpperCase()) {
    case 'TND': tnd = raw;                       break;
    case 'EUR': tnd = raw * EUR_TO_TND;          break;
    case 'USD': tnd = raw * EUR_TO_TND * 0.92;   break;
    case 'GBP': tnd = raw * EUR_TO_TND * 1.17;   break;
    default:    tnd = raw * EUR_TO_TND;
  }
  return +(tnd * MARGIN).toFixed(2);
};

// ── Normalise a hotel from availability response ──────────────
const normaliseHotel = (hotel) => {
  const minRoom  = hotel.rooms?.reduce((best, r) => {
    const rate = r.rates?.[0];
    if (!rate) return best;
    return (!best || parseFloat(rate.net) < parseFloat(best.net)) ? rate : best;
  }, null);

  const originalAmount   = minRoom?.net   || '0';
  const originalCurrency = 'EUR';
  const tndPrice         = toTND(originalAmount, originalCurrency);

  // Images
  const images = (hotel.images || [])
    .filter(i => i.path)
    .sort((a, b) => (a.visualOrder ?? 99) - (b.visualOrder ?? 99))
    .map(i => `https://photos.hotelbeds.com/giata/bigger/${i.path}`);

  // Stars
  const stars = parseInt(hotel.categoryCode?.replace('STARS_', '').replace('ESTE', '') || '0');

  // Facilities summary
  const facilities = (hotel.facilities || []).map(f => f.description?.content || '').filter(Boolean);

  return {
    code:              hotel.code,
    name:              hotel.name?.content || hotel.name || 'Hôtel',
    category_name:     hotel.categoryName?.content || '',
    stars,

    // Price TND (displayed to client)
    total_amount:      String(tndPrice),
    total_currency:    'TND',

    // Original price for booking
    _original_amount:   originalAmount,
    _original_currency: originalCurrency,

    // Location
    destination_code:  hotel.destinationCode || '',
    destination_name:  hotel.destinationName?.content || '',
    zone_code:         hotel.zoneCode || '',
    zone_name:         hotel.zoneName?.content || '',
    address:           hotel.address?.content || '',
    city:              hotel.city?.content || '',
    country_code:      hotel.countryCode || '',
    latitude:          parseFloat(hotel.coordinates?.latitude  || 0),
    longitude:         parseFloat(hotel.coordinates?.longitude || 0),

    // Media
    images,
    main_image:        images[0] || null,

    // Details
    description:       hotel.description?.content || '',
    facilities,
    rooms:             hotel.rooms || [],

    // Min room info
    min_rate_key:      minRoom?.rateKey   || null,
    min_room_code:     hotel.rooms?.[0]?.code || null,
    min_room_name:     hotel.rooms?.[0]?.name?.content || '',
    board_name:        minRoom?.boardName  || '',
    cancellation_policies: minRoom?.cancellationPolicies || [],

    // Availability
    available_rooms:   hotel.rooms?.length || 0,
  };
};

// ── Normalise a booking response ──────────────────────────────
const normaliseBooking = (booking) => ({
  reference:       booking.reference,
  client_reference: booking.clientReference,
  status:          booking.status,
  hotel:           booking.hotel,
  holder:          booking.holder,
  total_amount:    booking.totalNet,
  total_currency:  booking.currency,
  creation_date:   booking.creationDate,
  check_in:        booking.hotel?.checkIn,
  check_out:       booking.hotel?.checkOut,
});

// ─────────────────────────────────────────────────────────────
// Search hotels availability
// ─────────────────────────────────────────────────────────────
const searchHotels = async ({
  destination,     // IATA destination code or Hotelbeds dest code e.g. "PMI"
  check_in,        // "YYYY-MM-DD"
  check_out,       // "YYYY-MM-DD"
  adults   = 1,
  children = 0,
  rooms    = 1,
  stars_filter,    // e.g. [3,4,5]
}) => {
  const childrenAges = Array(children).fill(10); // default age 10 for children

  const occupancy = [{
    rooms:    rooms,
    adults:   adults,
    children: children,
    paxes:    childrenAges.map(age => ({ type: 'CH', age })),
  }];

  const body = {
    stay:       { checkIn: check_in, checkOut: check_out },
    occupancies: occupancy,
    destination: { code: destination },
    ...(stars_filter?.length && {
      filter: { minCategory: Math.min(...stars_filter), maxCategory: Math.max(...stars_filter) },
    }),
    reviews: [{ type: 'HOTELBEDS', maxRate: 5, minRate: 1, minReviewCount: 3 }],
  };

  const res = await fetch(`${BASE_URL}/hotel-api/1.0/hotels`, {
    method:  'POST',
    headers: headers(),
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Hotelbeds API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const hotels = data.hotels?.hotels || [];

  return {
    check_in,
    check_out,
    adults,
    children,
    total:  data.hotels?.total || hotels.length,
    hotels: hotels.map(normaliseHotel),
  };
};

// ─────────────────────────────────────────────────────────────
// Get hotel details by code
// ─────────────────────────────────────────────────────────────
const getHotelDetails = async (hotelCode) => {
  const res = await fetch(`${BASE_URL}/hotel-content-api/1.0/hotels/${hotelCode}/details?language=ENG&useSecondaryLanguage=false`, {
    headers: headers(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Hotelbeds content API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return normaliseHotel(data.hotel);
};

// ─────────────────────────────────────────────────────────────
// Book a hotel
// ─────────────────────────────────────────────────────────────
const bookHotel = async ({ rate_key, holder, rooms_pax, client_reference }) => {
  const body = {
    holder: {
      name:    holder.first_name.toUpperCase(),
      surname: holder.last_name.toUpperCase(),
    },
    rooms: rooms_pax.map(room => ({
      rateKey: rate_key,
      paxes:   room.paxes.map(pax => ({
        roomId:  1,
        type:    pax.type || 'AD',
        name:    pax.name.toUpperCase(),
        surname: pax.surname.toUpperCase(),
      })),
    })),
    clientReference:   client_reference || `TICTAC-${Date.now()}`,
    remark:            'Booked via TicTac Voyages',
    tolerance:         2,
  };

  const res = await fetch(`${BASE_URL}/hotel-api/1.0/bookings`, {
    method:  'POST',
    headers: headers(),
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Booking failed: ${res.status}`);
  }

  const data = await res.json();
  return normaliseBooking(data.booking);
};

// ─────────────────────────────────────────────────────────────
// Cancel a booking
// ─────────────────────────────────────────────────────────────
const cancelBooking = async (bookingReference) => {
  const res = await fetch(
    `${BASE_URL}/hotel-api/1.0/bookings/${bookingReference}?cancellationFlag=CANCELLATION`,
    { method: 'DELETE', headers: headers() }
  );
  if (!res.ok) throw new Error(`Cancel failed: ${res.status}`);
  const data = await res.json();
  return data.booking;
};

// ─────────────────────────────────────────────────────────────
// Get destinations list (for autocomplete)
// ─────────────────────────────────────────────────────────────
const getDestinations = async (countryCode = 'TN') => {
  const res = await fetch(
    `${BASE_URL}/hotel-content-api/1.0/locations/destinations?countryCode=${countryCode}&language=ENG&from=1&to=100`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`Destinations error: ${res.status}`);
  const data = await res.json();
  return data.destinations || [];
};

module.exports = { searchHotels, getHotelDetails, bookHotel, cancelBooking, getDestinations, toTND };