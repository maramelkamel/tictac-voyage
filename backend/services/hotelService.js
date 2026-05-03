const HotelModel = require('../models/hotelModel');

const DEFAULT_AMENITIES = ['WiFi', 'Pool', 'Breakfast', 'Parking'];
const DEFAULT_GALLERY = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&q=80',
  'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=1200&q=80',
];

const ensureHotelSchema = async () => {
  const pool = require('../config/db');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.hotels_catalog (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      subtitle TEXT,
      city VARCHAR(120) NOT NULL,
      address TEXT,
      description TEXT,
      image_url TEXT,
      gallery JSONB NOT NULL DEFAULT '[]',
      highlights JSONB NOT NULL DEFAULT '[]',
      room_types JSONB NOT NULL DEFAULT '[]',
      policies JSONB NOT NULL DEFAULT '[]',
      nearby_places JSONB NOT NULL DEFAULT '[]',
      amenities JSONB NOT NULL DEFAULT '[]',
      property_type VARCHAR(120),
      badge VARCHAR(120),
      stars INTEGER NOT NULL DEFAULT 4,
      rating NUMERIC(3,1),
      reviews INTEGER NOT NULL DEFAULT 0,
      base_price NUMERIC(10,2),
      old_price NUMERIC(10,2),
      currency VARCHAR(10) NOT NULL DEFAULT 'TND',
      total_rooms INTEGER NOT NULL DEFAULT 20,
      checkin_time VARCHAR(20) DEFAULT '14:00',
      checkout_time VARCHAR(20) DEFAULT '12:00',
      meals VARCHAR(120),
      availability VARCHAR(120) NOT NULL DEFAULT 'Available',
      is_featured BOOLEAN NOT NULL DEFAULT false,
      display_order INTEGER NOT NULL DEFAULT 0,
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
      currency VARCHAR(10) NOT NULL DEFAULT 'TND',
      promo_code VARCHAR(60),
      applied_promotion JSONB,
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

  await pool.query(`
    ALTER TABLE public.hotels_catalog
      ADD COLUMN IF NOT EXISTS subtitle TEXT,
      ADD COLUMN IF NOT EXISTS gallery JSONB NOT NULL DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS highlights JSONB NOT NULL DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS room_types JSONB NOT NULL DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS policies JSONB NOT NULL DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS nearby_places JSONB NOT NULL DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS property_type VARCHAR(120),
      ADD COLUMN IF NOT EXISTS badge VARCHAR(120),
      ADD COLUMN IF NOT EXISTS stars INTEGER NOT NULL DEFAULT 4,
      ADD COLUMN IF NOT EXISTS reviews INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS old_price NUMERIC(10,2),
      ADD COLUMN IF NOT EXISTS total_rooms INTEGER NOT NULL DEFAULT 20,
      ADD COLUMN IF NOT EXISTS checkin_time VARCHAR(20) DEFAULT '14:00',
      ADD COLUMN IF NOT EXISTS checkout_time VARCHAR(20) DEFAULT '12:00',
      ADD COLUMN IF NOT EXISTS meals VARCHAR(120),
      ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
  `);

  await pool.query(`
    ALTER TABLE public.hotel_reservations
      ADD COLUMN IF NOT EXISTS promo_code VARCHAR(60),
      ADD COLUMN IF NOT EXISTS applied_promotion JSONB;
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_hotels_catalog_city ON public.hotels_catalog (LOWER(city));`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_hotels_catalog_name ON public.hotels_catalog (LOWER(name));`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_hotels_catalog_featured ON public.hotels_catalog (is_featured, display_order);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_hotel_reservations_user ON public.hotel_reservations (user_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_hotel_reservations_status ON public.hotel_reservations (status);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_hotel_reservations_hotel ON public.hotel_reservations (hotel_id);`);

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

  const hotels = [
    {
      name: 'Movenpick Hotel du Lac Tunis',
      subtitle: 'Business, lake view and premium comfort',
      city: 'Tunis',
      address: 'Rue du Lac Huron, Berges du Lac, Tunis',
      description: 'A refined five-star stay near the lake, ideal for business trips and premium city breaks.',
      image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
      gallery: DEFAULT_GALLERY,
      highlights: ['Lake view rooms', 'Spa and wellness area', 'Business-friendly location'],
      room_types: ['Classic Room', 'Deluxe Lake Room', 'Executive Suite'],
      policies: ['Free cancellation up to 48h before arrival', 'Valid ID required at check-in', 'No smoking rooms'],
      nearby_places: ['Berges du Lac', 'Tunis Carthage Airport', 'Downtown Tunis'],
      amenities: [...DEFAULT_AMENITIES, 'Spa'],
      property_type: 'Luxury Hotel',
      badge: 'Best Seller',
      stars: 5,
      rating: 4.8,
      reviews: 412,
      base_price: 690,
      old_price: 760,
      currency: 'TND',
      total_rooms: 40,
      checkin_time: '14:00',
      checkout_time: '12:00',
      meals: 'Breakfast included',
      availability: 'Limited availability',
      is_featured: true,
      display_order: 1,
    },
    {
      name: 'Sousse Pearl Marriott Resort & Spa',
      subtitle: 'Seafront resort with pools and family facilities',
      city: 'Sousse',
      address: 'Boulevard Abdelhamid El Kadhi, Sousse',
      description: 'A seafront resort with spacious rooms, pools and a polished resort atmosphere close to the marina.',
      image_url: 'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=1200&q=80',
      gallery: DEFAULT_GALLERY,
      highlights: ['Private beach access', 'Outdoor pool', 'Family-friendly resort'],
      room_types: ['City View Room', 'Sea View Room', 'Family Suite'],
      policies: ['Breakfast buffet included', 'Children welcome', 'Outdoor pool seasonal'],
      nearby_places: ['Port El Kantaoui', 'Sousse Medina', 'Sousse Beach'],
      amenities: [...DEFAULT_AMENITIES, 'Beach'],
      property_type: 'Beach Resort',
      badge: 'Popular',
      stars: 5,
      rating: 4.7,
      reviews: 531,
      base_price: 720,
      old_price: 810,
      currency: 'TND',
      total_rooms: 55,
      checkin_time: '15:00',
      checkout_time: '12:00',
      meals: 'Breakfast and dinner available',
      availability: 'Available',
      is_featured: true,
      display_order: 2,
    },
    {
      name: 'The Sindbad Hammamet',
      subtitle: 'Iconic seaside escape with lush gardens',
      city: 'Hammamet',
      address: 'Avenue des Nations Unies, Hammamet',
      description: 'An elegant Hammamet address with garden views, private beach access and a relaxed upscale feel.',
      image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80',
      gallery: DEFAULT_GALLERY,
      highlights: ['Private beach', 'Garden suites', 'Romantic atmosphere'],
      room_types: ['Garden Room', 'Sea View Room', 'Junior Suite'],
      policies: ['Check-in from 14:00', 'Smart casual dinner dress code', 'Airport transfers on request'],
      nearby_places: ['Hammamet Medina', 'Yasmine Hammamet', 'Golf Citrus'],
      amenities: [...DEFAULT_AMENITIES, 'Beach'],
      property_type: 'Boutique Resort',
      badge: 'Romantic',
      stars: 5,
      rating: 4.9,
      reviews: 387,
      base_price: 840,
      old_price: 920,
      currency: 'TND',
      total_rooms: 30,
      checkin_time: '14:00',
      checkout_time: '12:00',
      meals: 'Half board available',
      availability: 'Only a few rooms left',
      is_featured: true,
      display_order: 3,
    },
    {
      name: 'Radisson Blu Palace Resort & Thalasso',
      subtitle: 'Large resort experience for leisure travellers',
      city: 'Djerba',
      address: 'Zone Touristique, Djerba',
      description: 'A resort-style property with broad leisure facilities, thalasso experiences and spacious beachfront areas.',
      image_url: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&q=80',
      gallery: DEFAULT_GALLERY,
      highlights: ['Thalasso center', 'Large resort pools', 'Beachfront promenade'],
      room_types: ['Standard Room', 'Premium Room', 'Palace Suite'],
      policies: ['Free cancellation up to 72h', 'Airport shuttle extra', 'Spa access by reservation'],
      nearby_places: ['Houmt Souk', 'Djerba Golf Club', 'Midoun'],
      amenities: [...DEFAULT_AMENITIES, 'Spa', 'Beach'],
      property_type: 'Resort',
      badge: 'Luxury',
      stars: 5,
      rating: 4.6,
      reviews: 449,
      base_price: 780,
      old_price: 860,
      currency: 'TND',
      total_rooms: 60,
      checkin_time: '15:00',
      checkout_time: '12:00',
      meals: 'All inclusive available',
      availability: 'Available',
      is_featured: true,
      display_order: 4,
    },
  ];

  for (const hotel of hotels) {
    await HotelModel.create(hotel);
  }
};

module.exports = {
  ensureHotelSchema,
  seedHotelsIfEmpty,
};
