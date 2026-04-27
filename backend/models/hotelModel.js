// backend/models/hotelModel.js
//
// Hôtels Tunisie: catalogue + réservations.
// - `price_options`: [{ label:'LPD', value:165 }, ...] (prix / nuit / chambre)
// - `gallery`: tableau d'URLs (ou /uploads/...)

const pool = require('../config/db');

const ensureHotelSchema = async () => {
  // Hotels table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.hotels (
      id            SERIAL PRIMARY KEY,
      code          VARCHAR(64) UNIQUE,
      name          TEXT NOT NULL,
      city          TEXT NOT NULL,
      address       TEXT,
      description   TEXT,
      image_url     TEXT,
      gallery       JSONB DEFAULT '[]'::jsonb,
      stars         INT   DEFAULT 4,
      amenities     JSONB DEFAULT '[]'::jsonb,
      price_options JSONB DEFAULT '[]'::jsonb,
      is_active     BOOLEAN DEFAULT TRUE,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Reservations table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.hotel_reservations (
      id                SERIAL PRIMARY KEY,
      hotel_id          INT REFERENCES public.hotels(id) ON DELETE SET NULL,
      hotel_name        TEXT NOT NULL,
      destination_code  VARCHAR(16),
      pension_code      VARCHAR(16),
      pension_price     NUMERIC,
      check_in          DATE NOT NULL,
      check_out         DATE NOT NULL,
      adults            INT DEFAULT 2,
      children          INT DEFAULT 0,
      rooms             INT DEFAULT 1,
      rooms_pax         JSONB DEFAULT '[]'::jsonb,
      holder_first_name TEXT,
      holder_last_name  TEXT,
      holder_email      TEXT,
      holder_phone      TEXT,
      total_price       NUMERIC DEFAULT 0,
      currency          VARCHAR(8) DEFAULT 'TND',
      payment_method    VARCHAR(16) DEFAULT 'agency',
      payment_status    VARCHAR(16) DEFAULT 'pending',
      status            VARCHAR(16) DEFAULT 'pending',
      created_at        TIMESTAMPTZ DEFAULT NOW(),
      updated_at        TIMESTAMPTZ DEFAULT NOW()
    )
  `);
};

const seedHotelsIfEmpty = async () => {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS c FROM public.hotels');
  if ((rows[0]?.c || 0) > 0) return;

  const sample = [
    {
      code: 'TN-HAM-001',
      name: 'Hammamet Palace Resort',
      city: 'Hammamet',
      address: 'Zone touristique, Hammamet',
      description: 'Resort en bord de mer, idéal pour familles et couples. Piscines, spa et accès plage.',
      stars: 5,
      image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80',
      amenities: ['Plage', 'Piscine', 'Spa', 'Wi‑Fi', 'Restaurant'],
      price_options: [
        { label: 'LPD', value: 180 },
        { label: 'DP', value: 240 },
        { label: 'PC', value: 310 },
        { label: 'AI', value: 480 },
      ],
      gallery: [],
      is_active: true,
    },
    {
      code: 'TN-SOU-002',
      name: 'Sousse Marina Hotel',
      city: 'Sousse',
      address: 'Port El Kantaoui, Sousse',
      description: 'Hôtel confortable proche des activités et de la marina. Excellent rapport qualité/prix.',
      stars: 4,
      image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80',
      amenities: ['Piscine', 'Wi‑Fi', 'Climatisation', 'Petit‑déjeuner'],
      price_options: [
        { label: 'LPD', value: 130 },
        { label: 'DP', value: 175 },
        { label: 'PC', value: 230 },
        { label: 'AI', value: 360 },
      ],
      gallery: [],
      is_active: true,
    },
    {
      code: 'TN-DJE-003',
      name: 'Djerba Lagoon & Spa',
      city: 'Djerba',
      address: 'Midoun, Djerba',
      description: 'Escapade détente à Djerba avec spa complet, activités et restauration variée.',
      stars: 5,
      image_url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80',
      amenities: ['Spa', 'Piscine', 'Kids club', 'All inclusive'],
      price_options: [
        { label: 'LPD', value: 190 },
        { label: 'DP', value: 255 },
        { label: 'PC', value: 330 },
        { label: 'AI', value: 520 },
      ],
      gallery: [],
      is_active: true,
    },
  ];

  for (const h of sample) {
    await pool.query(
      `
      INSERT INTO public.hotels
        (code, name, city, address, description, image_url, gallery, stars, amenities, price_options, is_active)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    `,
      [
        h.code,
        h.name,
        h.city,
        h.address || null,
        h.description || null,
        h.image_url || null,
        JSON.stringify(h.gallery || []),
        h.stars || 4,
        JSON.stringify(h.amenities || []),
        JSON.stringify(h.price_options || []),
        h.is_active !== false,
      ]
    );
  }
};

const listHotels = async ({ publicOnly = false, city, sort = 'stars', limit = 12, page = 1, search } = {}) => {
  const where = [];
  const vals = [];

  if (publicOnly) where.push('is_active = true');
  if (city) {
    vals.push(city);
    where.push(`LOWER(city) = LOWER($${vals.length})`);
  }
  if (search) {
    vals.push(`%${String(search).toLowerCase()}%`);
    const p = `$${vals.length}`;
    where.push(`(LOWER(name) LIKE ${p} OR LOWER(address) LIKE ${p} OR LOWER(city) LIKE ${p})`);
  }

  const order = (() => {
    if (sort === 'price') return `COALESCE((price_options->0->>'value')::numeric, 0) ASC`;
    if (sort === 'name') return `name ASC`;
    return `stars DESC, created_at DESC`;
  })();

  const safeLimit = Math.max(1, Math.min(60, Number(limit) || 12));
  const safePage = Math.max(1, Number(page) || 1);
  const offset = (safePage - 1) * safeLimit;

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const totalRes = await pool.query(`SELECT COUNT(*)::int AS c FROM public.hotels ${whereSql}`, vals);

  vals.push(safeLimit);
  vals.push(offset);
  const { rows } = await pool.query(
    `
    SELECT *
    FROM public.hotels
    ${whereSql}
    ORDER BY ${order}
    LIMIT $${vals.length - 1} OFFSET $${vals.length}
  `,
    vals
  );

  return { hotels: rows, total: totalRes.rows[0]?.c || 0 };
};

const getHotelById = async (id, { publicOnly = false } = {}) => {
  const vals = [id];
  let q = 'SELECT * FROM public.hotels WHERE id = $1';
  if (publicOnly) q += ' AND is_active = true';
  const { rows } = await pool.query(q, vals);
  return rows[0] || null;
};

const createHotel = async (data) => {
  const {
    code,
    name,
    city,
    address,
    description,
    image_url,
    gallery,
    stars,
    amenities,
    price_options,
    is_active,
  } = data;

  const { rows } = await pool.query(
    `
    INSERT INTO public.hotels
      (code, name, city, address, description, image_url, gallery, stars, amenities, price_options, is_active, created_at, updated_at)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, NOW(), NOW())
    RETURNING *
  `,
    [
      code || null,
      name,
      city,
      address || null,
      description || null,
      image_url || null,
      JSON.stringify(gallery || []),
      Number(stars) || 4,
      JSON.stringify(amenities || []),
      JSON.stringify(price_options || []),
      is_active !== false,
    ]
  );
  return rows[0];
};

const updateHotel = async (id, data) => {
  const {
    code,
    name,
    city,
    address,
    description,
    image_url,
    gallery,
    stars,
    amenities,
    price_options,
    is_active,
  } = data;

  const { rows } = await pool.query(
    `
    UPDATE public.hotels SET
      code          = COALESCE($1, code),
      name          = COALESCE($2, name),
      city          = COALESCE($3, city),
      address       = COALESCE($4, address),
      description   = COALESCE($5, description),
      image_url     = COALESCE($6, image_url),
      gallery       = COALESCE($7, gallery),
      stars         = COALESCE($8, stars),
      amenities     = COALESCE($9, amenities),
      price_options = COALESCE($10, price_options),
      is_active     = COALESCE($11, is_active),
      updated_at    = NOW()
    WHERE id = $12
    RETURNING *
  `,
    [
      code ?? null,
      name ?? null,
      city ?? null,
      address ?? null,
      description ?? null,
      image_url ?? null,
      gallery ? JSON.stringify(gallery) : null,
      stars !== undefined ? Number(stars) : null,
      amenities ? JSON.stringify(amenities) : null,
      price_options ? JSON.stringify(price_options) : null,
      is_active !== undefined ? !!is_active : null,
      id,
    ]
  );
  return rows[0] || null;
};

const deleteHotel = async (id) => {
  const { rows } = await pool.query('DELETE FROM public.hotels WHERE id=$1 RETURNING id', [id]);
  return rows[0] || null;
};

// ── Reservations ─────────────────────────────────────────────
const createReservation = async (payload) => {
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
    currency = 'TND',
    payment_method = 'agency',
  } = payload;

  const { rows } = await pool.query(
    `
    INSERT INTO public.hotel_reservations (
      hotel_id, hotel_name, destination_code, pension_code, pension_price,
      check_in, check_out, adults, children, rooms, rooms_pax,
      holder_first_name, holder_last_name, holder_email, holder_phone,
      total_price, currency, payment_method, payment_status, status, created_at, updated_at
    )
    VALUES (
      $1,$2,$3,$4,$5,
      $6,$7,$8,$9,$10,$11,
      $12,$13,$14,$15,
      $16,$17,$18,'pending','pending', NOW(), NOW()
    )
    RETURNING *
  `,
    [
      hotel_id || null,
      hotel_name,
      destination_code || null,
      pension_code || null,
      pension_price ?? null,
      check_in,
      check_out,
      Number(adults) || 2,
      Number(children) || 0,
      Number(rooms) || 1,
      JSON.stringify(rooms_pax || []),
      holder_first_name || null,
      holder_last_name || null,
      holder_email || null,
      holder_phone || null,
      Number(total_price) || 0,
      currency,
      payment_method,
    ]
  );
  return rows[0];
};

const listReservations = async () => {
  const { rows } = await pool.query(
    'SELECT * FROM public.hotel_reservations ORDER BY created_at DESC'
  );
  return rows;
};

const updateReservationStatus = async (id, status) => {
  const { rows } = await pool.query(
    `
    UPDATE public.hotel_reservations
    SET status=$1, updated_at=NOW()
    WHERE id=$2
    RETURNING *
  `,
    [status, id]
  );
  return rows[0] || null;
};

module.exports = {
  ensureHotelSchema,
  seedHotelsIfEmpty,
  listHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  createReservation,
  listReservations,
  updateReservationStatus,
};

