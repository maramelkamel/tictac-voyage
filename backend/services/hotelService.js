const HotelModel = require('../models/hotelModel');

const MAKCORPS_API_KEY = process.env.MAKCORPS_API_KEY || '69f0c445bd5b9206d5e814e1';
const RAPIDAPI_KEY = process.env.BOOKING_RAPIDAPI_KEY || 'd9315e07dbmsh661111331e771f4p12ac73jsn2ae4435d3080';
const RAPIDAPI_HOST = process.env.BOOKING_RAPIDAPI_HOST || 'apidojo-booking-v1.p.rapidapi.com';

const CITY_BBOXES = {
  tunis: '10.10,36.60,10.30,36.85',
  sousse: '10.55,35.75,10.72,35.91',
  hammamet: '10.53,36.35,10.68,36.47',
};

const DEFAULT_AMENITIES = ['WiFi', 'Pool', 'Breakfast', 'Parking'];

const sanitizeCity = (city = 'Tunis') => city.trim() || 'Tunis';

const getCityBbox = (city = 'Tunis') => CITY_BBOXES[sanitizeCity(city).toLowerCase()] || CITY_BBOXES.tunis;

const buildHotelDescription = (hotelName, city) =>
  `${hotelName || 'This hotel'} is a comfortable stay in ${city || 'Tunisia'}, offering modern amenities and attentive service for travelers.`;

const callJsonApi = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
  }
  return response.json();
};

const getCityId = async (city) => {
  const targetCity = sanitizeCity(city);
  const url = new URL('https://api.makcorps.com/mapping');
  url.searchParams.set('name', targetCity);
  url.searchParams.set('api_key', MAKCORPS_API_KEY);

  const data = await callJsonApi(url);
  const items = Array.isArray(data) ? data : [];
  const match =
    items.find((item) => item?.type === 'GEO' && item?.document_id) ||
    items.find((item) => item?.document_id);

  if (!match?.document_id) {
    throw new Error(`No MakCorps city ID found for ${targetCity}.`);
  }

  return {
    city: targetCity,
    cityId: String(match.document_id),
    raw: items,
  };
};

const getHotelsFromMakCorps = async ({
  cityId,
  page = 0,
  currency = 'USD',
  rooms = 1,
  adults = 2,
  checkin,
  checkout,
}) => {
  const url = new URL('https://api.makcorps.com/city');
  url.searchParams.set('cityid', String(cityId));
  url.searchParams.set('pagination', String(page));
  url.searchParams.set('cur', currency);
  url.searchParams.set('rooms', String(rooms));
  url.searchParams.set('adults', String(adults));
  url.searchParams.set('checkin', checkin);
  url.searchParams.set('checkout', checkout);
  url.searchParams.set('api_key', MAKCORPS_API_KEY);

  const data = await callJsonApi(url);
  const hotels = Array.isArray(data)
    ? data
    : Array.isArray(data?.hotels)
      ? data.hotels
      : Array.isArray(data?.data)
        ? data.data
        : [];

  return {
    hotels,
    total: data?.totalHotelCount || hotels.length,
    totalPages: data?.totalpageCount || 1,
    currentPage: data?.currentPageNumber ?? page,
    raw: data,
  };
};

const getHotelsFromBookingAPI = async ({
  city,
  bbox,
  page = 1,
  pageSize = 10,
  checkin,
  checkout,
  adults = 2,
  rooms = 1,
  currency = 'USD',
}) => {
  const offset = Math.max(0, (page - 1) * pageSize);
  const url = new URL(`https://${RAPIDAPI_HOST}/properties/list-by-map`);

  url.searchParams.set('bbox', bbox || getCityBbox(city));
  url.searchParams.set('arrival_date', checkin);
  url.searchParams.set('departure_date', checkout);
  url.searchParams.set('guest_qty', String(adults));
  url.searchParams.set('room_qty', String(rooms));
  url.searchParams.set('search_id', 'none');
  url.searchParams.set('children_qty', '0');
  url.searchParams.set('children_age', '');
  url.searchParams.set('languagecode', 'en-us');
  url.searchParams.set('travel_purpose', 'leisure');
  url.searchParams.set('order_by', 'popularity');
  url.searchParams.set('offset', String(offset));
  url.searchParams.set('price_filter_currencycode', currency);

  const data = await callJsonApi(url, {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
  });

  const hotels = Array.isArray(data)
    ? data
    : Array.isArray(data?.result)
      ? data.result
      : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.search_results)
          ? data.search_results
          : [];

  return {
    hotels,
    total: data?.count || data?.total_count || hotels.length,
    offset,
    raw: data,
  };
};

const ensureHotelSchema = async () => {
  const pool = require('../config/db');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.hotels_catalog (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      city VARCHAR(120) NOT NULL,
      address TEXT,
      description TEXT,
      image_url TEXT,
      rating NUMERIC(3,1),
      amenities JSONB NOT NULL DEFAULT '[]',
      base_price NUMERIC(10,2),
      currency VARCHAR(10) NOT NULL DEFAULT 'USD',
      availability VARCHAR(120) NOT NULL DEFAULT 'Available',
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.hotel_reservations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      hotel_id INTEGER,
      hotel_name VARCHAR(255) NOT NULL,
      hotel_city VARCHAR(120),
      hotel_location TEXT,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      adults INTEGER NOT NULL DEFAULT 2,
      rooms INTEGER NOT NULL DEFAULT 1,
      total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
      currency VARCHAR(10) NOT NULL DEFAULT 'USD',
      payment_method VARCHAR(20) NOT NULL DEFAULT 'agency'
        CHECK (payment_method IN ('online','agency')),
      status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','confirmed','cancelled','completed')),
      payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (payment_status IN ('pending','paid','refunded')),
      holder_first_name VARCHAR(120) NOT NULL,
      holder_last_name VARCHAR(120) NOT NULL,
      holder_email VARCHAR(255) NOT NULL,
      holder_phone VARCHAR(60) NOT NULL,
      special_requests TEXT,
      selected_hotel JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_hotels_catalog_city ON public.hotels_catalog (LOWER(city));`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_hotels_catalog_name ON public.hotels_catalog (LOWER(name));`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_hotel_reservations_user ON public.hotel_reservations (user_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_hotel_reservations_status ON public.hotel_reservations (status);`);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'trg_hotels_catalog_updated'
      ) THEN
        CREATE TRIGGER trg_hotels_catalog_updated
        BEFORE UPDATE ON public.hotels_catalog
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
      END IF;
    END $$;
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'trg_hotel_reservations_updated'
      ) THEN
        CREATE TRIGGER trg_hotel_reservations_updated
        BEFORE UPDATE ON public.hotel_reservations
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
      END IF;
    END $$;
  `);
};

const seedHotelsIfEmpty = async () => {
  const total = await HotelModel.count();
  if (total > 0) return;

  const demoHotels = [
    {
      name: 'Tunis Central Suites',
      city: 'Tunis',
      address: 'Centre-ville, Tunis',
      description: buildHotelDescription('Tunis Central Suites', 'Tunis'),
      image_url: 'https://source.unsplash.com/300x200/?hotel,tunis',
      rating: 4.4,
      amenities: DEFAULT_AMENITIES,
      base_price: 132,
      availability: 'Available',
    },
    {
      name: 'Sousse Marina Hotel',
      city: 'Sousse',
      address: 'Marina El Kantaoui, Sousse',
      description: buildHotelDescription('Sousse Marina Hotel', 'Sousse'),
      image_url: 'https://source.unsplash.com/300x200/?hotel,sousse',
      rating: 4.6,
      amenities: DEFAULT_AMENITIES,
      base_price: 148,
      availability: 'Only 3 rooms left',
    },
    {
      name: 'Hammamet Garden Resort',
      city: 'Hammamet',
      address: 'Zone touristique, Hammamet',
      description: buildHotelDescription('Hammamet Garden Resort', 'Hammamet'),
      image_url: 'https://source.unsplash.com/300x200/?hotel,hammamet',
      rating: 4.7,
      amenities: DEFAULT_AMENITIES,
      base_price: 165,
      availability: 'Available',
    },
  ];

  for (const hotel of demoHotels) {
    await HotelModel.create(hotel);
  }
};

module.exports = {
  getCityBbox,
  getCityId,
  getHotelsFromMakCorps,
  getHotelsFromBookingAPI,
  ensureHotelSchema,
  seedHotelsIfEmpty,
};
