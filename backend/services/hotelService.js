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
      meal_plans JSONB NOT NULL DEFAULT '[]',
      room_views JSONB NOT NULL DEFAULT '[]',
      reservation_extras JSONB NOT NULL DEFAULT '[]',
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
      children INTEGER NOT NULL DEFAULT 0,
      rooms INTEGER NOT NULL DEFAULT 1,
      room_type VARCHAR(120),
      meal_plan VARCHAR(120),
      room_view VARCHAR(120),
      bed_preference VARCHAR(120),
      arrival_time VARCHAR(40),
      airport_transfer BOOLEAN NOT NULL DEFAULT false,
      selected_extras JSONB NOT NULL DEFAULT '[]',
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
      ADD COLUMN IF NOT EXISTS meal_plans JSONB NOT NULL DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS room_views JSONB NOT NULL DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS reservation_extras JSONB NOT NULL DEFAULT '[]',
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
      ADD COLUMN IF NOT EXISTS children INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS room_type VARCHAR(120),
      ADD COLUMN IF NOT EXISTS meal_plan VARCHAR(120),
      ADD COLUMN IF NOT EXISTS room_view VARCHAR(120),
      ADD COLUMN IF NOT EXISTS bed_preference VARCHAR(120),
      ADD COLUMN IF NOT EXISTS arrival_time VARCHAR(40),
      ADD COLUMN IF NOT EXISTS airport_transfer BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS selected_extras JSONB NOT NULL DEFAULT '[]',
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

module.exports = {
  ensureHotelSchema,
};
