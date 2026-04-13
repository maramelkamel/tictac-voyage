-- ============================================================
--  migrations/001_hotels.sql
--  Run once: psql -d yourdb -f migrations/001_hotels.sql
-- ============================================================

-- ── Hotels table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hotels (
  id               SERIAL PRIMARY KEY,
  tripadvisor_id   TEXT UNIQUE,          -- TripAdvisor location_id
  name             TEXT NOT NULL,
  description      TEXT DEFAULT '',
  location         TEXT DEFAULT '',      -- city name
  address          TEXT DEFAULT '',
  latitude         NUMERIC(10, 7),
  longitude        NUMERIC(10, 7),
  stars            SMALLINT,             -- 1-5
  rating           NUMERIC(3, 1),        -- e.g. 4.5
  num_reviews      INTEGER DEFAULT 0,
  ranking_string   TEXT DEFAULT '',
  price_min        INTEGER,              -- TND, +10% markup applied
  price_max        INTEGER,              -- TND
  price_label      TEXT DEFAULT '',      -- "$$$" style label
  image_url        TEXT,                 -- primary image
  gallery          JSONB DEFAULT '[]',   -- extra image URLs
  amenities        JSONB DEFAULT '[]',   -- array of strings
  subcategories    JSONB DEFAULT '[]',
  website          TEXT DEFAULT '',
  phone            TEXT DEFAULT '',
  email            TEXT DEFAULT '',
  raw_data         JSONB,                -- full TripAdvisor payload
  is_featured      BOOLEAN DEFAULT FALSE,
  is_active        BOOLEAN DEFAULT TRUE,
  cached_at        TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hotels_location    ON hotels (location);
CREATE INDEX IF NOT EXISTS idx_hotels_stars       ON hotels (stars);
CREATE INDEX IF NOT EXISTS idx_hotels_rating      ON hotels (rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_hotels_price_min   ON hotels (price_min);
CREATE INDEX IF NOT EXISTS idx_hotels_cached_at   ON hotels (cached_at);
CREATE INDEX IF NOT EXISTS idx_hotels_is_active   ON hotels (is_active);

-- ── Hotel reservations table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS hotel_reservations (
  id               SERIAL PRIMARY KEY,
  hotel_id         INTEGER REFERENCES hotels(id) ON DELETE SET NULL,
  hotel_name       TEXT,
  hotel_location   TEXT,

  -- Guest info
  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT,

  -- Stay details
  check_in         DATE NOT NULL,
  check_out        DATE NOT NULL,
  adults           SMALLINT DEFAULT 2,
  children         SMALLINT DEFAULT 0,
  rooms            SMALLINT DEFAULT 1,
  room_type        TEXT DEFAULT 'Chambre Standard',
  pension          TEXT DEFAULT 'All Inclusive',
  special_requests TEXT DEFAULT '',

  -- Pricing
  price_per_night  NUMERIC(10,2),
  subtotal         NUMERIC(10,2),
  taxes            NUMERIC(10,2),
  total            NUMERIC(10,2),

  -- Payment
  payment_method   TEXT DEFAULT 'pending',   -- online | agency | pending
  payment_status   TEXT DEFAULT 'pending',   -- paid | pending | failed | refunded
  status           TEXT DEFAULT 'pending',   -- pending | confirmed | cancelled

  -- Admin
  admin_notes      TEXT DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hr_email       ON hotel_reservations (email);
CREATE INDEX IF NOT EXISTS idx_hr_hotel_id    ON hotel_reservations (hotel_id);
CREATE INDEX IF NOT EXISTS idx_hr_status      ON hotel_reservations (status);
CREATE INDEX IF NOT EXISTS idx_hr_check_in    ON hotel_reservations (check_in);

-- ── Auto-update updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_hotels_updated_at ON hotels;
CREATE TRIGGER set_hotels_updated_at
  BEFORE UPDATE ON hotels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_hr_updated_at ON hotel_reservations;
CREATE TRIGGER set_hr_updated_at
  BEFORE UPDATE ON hotel_reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Sample seed data (used when API key not available) ────────
INSERT INTO hotels (
  tripadvisor_id, name, description, location, address,
  stars, rating, num_reviews, price_min, price_max,
  image_url, amenities, is_featured, cached_at
) VALUES
(
  'seed_001',
  'The Residence Tunis',
  'Palace cinq étoiles niché dans un parc de 6 hectares face à la plage de La Marsa, offrant des chambres lumineuses, des jardins méditerranéens et un spa de renom.',
  'Tunis',
  'Les Côtes de Carthage, Gammarth, Tunis',
  5, 9.2, 1842,
  ROUND(630 * 1.10), ROUND(1200 * 1.10),
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80',
  '["WiFi gratuit","Piscine","Spa","Parking","Restaurant","Plage privée","Salle de sport","Room service","Tennis","Bar"]',
  TRUE, NOW() - INTERVAL '1 hour'
),
(
  'seed_002',
  'Hasdrubal Thalassa & Spa Hammamet',
  'Resort balnéaire haut de gamme directement sur la plage de Hammamet, célèbre pour son thalasso-spa et ses piscines en cascade face à la mer.',
  'Hammamet',
  'Route de Nabeul, Hammamet',
  5, 8.9, 2356,
  ROUND(320 * 1.10), ROUND(780 * 1.10),
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&q=80',
  '["WiFi gratuit","Piscine","Thalasso","Plage privée","Restaurant","Animation","Parking","Bar","Sports nautiques","Hammam"]',
  TRUE, NOW() - INTERVAL '1 hour'
),
(
  'seed_003',
  'Diar Lemdina Hotel Hammamet',
  'Hôtel de charme inspiré de la médina tunisienne, avec ses patios fleuris, sa piscine luxuriante et son accès à la plage dorée de Hammamet.',
  'Hammamet',
  'Zone Touristique, Hammamet Nord',
  4, 8.5, 1104,
  ROUND(180 * 1.10), ROUND(420 * 1.10),
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&q=80',
  '["WiFi gratuit","Piscine","Plage","Restaurant","Parking","Animation","Bar","Climatisation"]',
  FALSE, NOW() - INTERVAL '1 hour'
),
(
  'seed_004',
  'Radisson Blu Palace Resort & Thalasso Djerba',
  'Resort de luxe sur l''île de Djerba avec thalassothérapie, lagune privée et une architecture mauresque époustouflante.',
  'Djerba',
  'Zone Touristique Midoun, Djerba',
  5, 9.0, 987,
  ROUND(450 * 1.10), ROUND(950 * 1.10),
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=900&q=80',
  '["WiFi gratuit","Thalasso","Piscine","Plage privée","Spa","Restaurant","Bar","Tennis","Sports nautiques","Enfants Club"]',
  TRUE, NOW() - INTERVAL '1 hour'
),
(
  'seed_005',
  'Mövenpick Resort & Marine Spa Sousse',
  'Élégant resort contemporain à Sousse, offrant un marine spa exclusif, plusieurs restaurants gastronomiques et une plage de sable blanc.',
  'Sousse',
  'Chott Meriem, Sousse',
  5, 8.8, 1567,
  ROUND(280 * 1.10), ROUND(650 * 1.10),
  'https://images.unsplash.com/photo-1551882547-ff40c4fe1dc7?w=900&q=80',
  '["WiFi gratuit","Spa","Piscine","Plage privée","Restaurant","Bar","Salle de sport","Hammam","Room service","Parking"]',
  FALSE, NOW() - INTERVAL '1 hour'
),
(
  'seed_006',
  'Anantara Sahara Tozeur Resort',
  'Oasis de luxe aux portes du Sahara, offrant des villas privées avec piscine, des excursions en dromadaire et un coucher de soleil sur les dunes inoubliable.',
  'Tozeur',
  'Zone Touristique, Tozeur',
  5, 9.4, 743,
  ROUND(520 * 1.10), ROUND(1100 * 1.10),
  'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=900&q=80',
  '["WiFi gratuit","Piscine privée","Spa","Excursions désert","Restaurant","Bar","Parking","Climatisation","Hammam"]',
  TRUE, NOW() - INTERVAL '1 hour'
),
(
  'seed_007',
  'Iberostar Selection Kuriat Palace Monastir',
  'Resort all-inclusive de 5 étoiles avec accès direct à la plage, animations tout public et buffets internationaux variés à Monastir.',
  'Monastir',
  'Route de la Falaise, Monastir',
  5, 8.6, 2103,
  ROUND(220 * 1.10), ROUND(500 * 1.10),
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80',
  '["All Inclusive","WiFi gratuit","Piscine","Plage","Restaurant","Animation","Sports nautiques","Mini-club","Bar","Tennis"]',
  FALSE, NOW() - INTERVAL '1 hour'
),
(
  'seed_008',
  'El Mouradi Cap Mahdia',
  'Complexe balnéaire familial en bord de mer à Mahdia avec animations quotidiennes, piscines et accès direct à une plage de sable fin.',
  'Mahdia',
  'Zone Touristique, Cap Mahdia',
  4, 8.2, 876,
  ROUND(155 * 1.10), ROUND(340 * 1.10),
  'https://images.unsplash.com/photo-1568310579941-6b6e1e6f3f35?w=900&q=80',
  '["WiFi gratuit","Piscine","Plage","Restaurant","Animation","Parking","Bar","Climatisation","Sports nautiques"]',
  FALSE, NOW() - INTERVAL '1 hour'
)
ON CONFLICT (tripadvisor_id) DO NOTHING;