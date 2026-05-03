const pool = require('../config/db');

const BASE_QUERY = `
  SELECT h.*,
    COALESCE(COUNT(r.id), 0)::int AS reservation_count,
    COALESCE(SUM(CASE WHEN r.status = 'confirmed' THEN r.rooms ELSE 0 END), 0)::int AS booked_rooms,
    GREATEST(
      COALESCE(h.total_rooms, 0) - COALESCE(SUM(CASE WHEN r.status = 'confirmed' THEN r.rooms ELSE 0 END), 0),
      0
    )::int AS available_rooms,
    CASE
      WHEN COALESCE(h.total_rooms, 0) > 0 THEN
        ROUND(
          LEAST(
            100,
            (
              COALESCE(SUM(CASE WHEN r.status = 'confirmed' THEN r.rooms ELSE 0 END), 0)::numeric
              / h.total_rooms
            ) * 100
          ),
          1
        )
      ELSE 0
    END AS occupancy_percentage
  FROM public.hotels_catalog h
  LEFT JOIN public.hotel_reservations r ON r.hotel_id = h.id
`;

const parseJson = (value, fallback = []) => {
  if (!value) return fallback;
  if (Array.isArray(value) || typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeRow = (row) => ({
  ...row,
  gallery: parseJson(row.gallery, []),
  highlights: parseJson(row.highlights, []),
  room_types: parseJson(row.room_types, []),
  meal_plans: parseJson(row.meal_plans, []),
  room_views: parseJson(row.room_views, []),
  reservation_extras: parseJson(row.reservation_extras, []),
  policies: parseJson(row.policies, []),
  nearby_places: parseJson(row.nearby_places, []),
  amenities: parseJson(row.amenities, []),
  reservation_count: Number(row.reservation_count || 0),
  booked_rooms: Number(row.booked_rooms || 0),
  available_rooms: Number(row.available_rooms || 0),
  occupancy_percentage: Number(row.occupancy_percentage || 0),
});

const ensureSettingsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.settings (
      key VARCHAR(100) PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
};

const getSetting = async (key) => {
  await ensureSettingsTable();
  const { rows } = await pool.query('SELECT value FROM public.settings WHERE key = $1', [key]);
  return rows[0]?.value ?? null;
};

const setSetting = async (key, value) => {
  await ensureSettingsTable();
  const { rows } = await pool.query(
    `INSERT INTO public.settings (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
     RETURNING value`,
    [key, JSON.stringify(value)]
  );
  return rows[0]?.value ?? null;
};

const getPublicHotels = async ({
  city,
  search,
  sortBy = 'featured',
  featuredOnly = false,
} = {}) => {
  const conditions = ['h.is_active = true'];
  const values = [];

  if (city) {
    values.push(city.trim().toLowerCase());
    conditions.push(`LOWER(h.city) = $${values.length}`);
  }

  if (search) {
    values.push(`%${search.trim().toLowerCase()}%`);
    conditions.push(`(
      LOWER(h.name) LIKE $${values.length}
      OR LOWER(COALESCE(h.subtitle, '')) LIKE $${values.length}
      OR LOWER(COALESCE(h.city, '')) LIKE $${values.length}
      OR LOWER(COALESCE(h.address, '')) LIKE $${values.length}
      OR LOWER(COALESCE(h.property_type, '')) LIKE $${values.length}
    )`);
  }

  if (featuredOnly) {
    conditions.push('h.is_featured = true');
  }

  const orderBy = {
    price_asc: 'h.base_price ASC NULLS LAST, h.name ASC',
    price_desc: 'h.base_price DESC NULLS LAST, h.name ASC',
    rating: 'h.rating DESC NULLS LAST, h.reviews DESC NULLS LAST',
    popular: 'reservation_count DESC, occupancy_percentage DESC, h.rating DESC NULLS LAST',
    featured: 'h.is_featured DESC, h.display_order ASC, h.rating DESC NULLS LAST, h.name ASC',
  }[sortBy] || 'h.is_featured DESC, h.display_order ASC, h.name ASC';

  const { rows } = await pool.query(
    `${BASE_QUERY}
     WHERE ${conditions.join(' AND ')}
     GROUP BY h.id
     ORDER BY ${orderBy}`,
    values
  );

  return rows.map(normalizeRow);
};

const getAdminHotels = async ({ city, search } = {}) => {
  const conditions = ['1 = 1'];
  const values = [];

  if (city) {
    values.push(city.trim().toLowerCase());
    conditions.push(`LOWER(h.city) = $${values.length}`);
  }

  if (search) {
    values.push(`%${search.trim().toLowerCase()}%`);
    conditions.push(`(
      LOWER(h.name) LIKE $${values.length}
      OR LOWER(COALESCE(h.subtitle, '')) LIKE $${values.length}
      OR LOWER(COALESCE(h.city, '')) LIKE $${values.length}
      OR LOWER(COALESCE(h.address, '')) LIKE $${values.length}
    )`);
  }

  const { rows } = await pool.query(
    `${BASE_QUERY}
     WHERE ${conditions.join(' AND ')}
     GROUP BY h.id
     ORDER BY h.display_order ASC, h.created_at DESC`,
    values
  );

  return rows.map(normalizeRow);
};

const getPopularHotels = async (limit = 4) => {
  const { rows } = await pool.query(
    `${BASE_QUERY}
     WHERE h.is_active = true
     GROUP BY h.id
     ORDER BY reservation_count DESC, occupancy_percentage DESC, h.is_featured DESC, h.rating DESC NULLS LAST
     LIMIT $1`,
    [limit]
  );
  return rows.map(normalizeRow);
};

const getById = async (id) => {
  const { rows } = await pool.query(
    `${BASE_QUERY}
     WHERE h.id = $1
     GROUP BY h.id`,
    [id]
  );
  return rows[0] ? normalizeRow(rows[0]) : null;
};

const serializeHotelPayload = (data = {}) => ({
  name: data.name,
  subtitle: data.subtitle || null,
  city: data.city,
  address: data.address || null,
  description: data.description || null,
  image_url: data.image_url || null,
  gallery: JSON.stringify(data.gallery || []),
  highlights: JSON.stringify(data.highlights || []),
  room_types: JSON.stringify(data.room_types || []),
  meal_plans: JSON.stringify(data.meal_plans || []),
  room_views: JSON.stringify(data.room_views || []),
  reservation_extras: JSON.stringify(data.reservation_extras || []),
  policies: JSON.stringify(data.policies || []),
  nearby_places: JSON.stringify(data.nearby_places || []),
  amenities: JSON.stringify(data.amenities || []),
  property_type: data.property_type || null,
  badge: data.badge || null,
  stars: Number(data.stars || 4),
  rating: data.rating === '' || data.rating === null || data.rating === undefined ? null : Number(data.rating),
  reviews: Number(data.reviews || 0),
  base_price: data.base_price === '' || data.base_price === null || data.base_price === undefined ? null : Number(data.base_price),
  old_price: data.old_price === '' || data.old_price === null || data.old_price === undefined ? null : Number(data.old_price),
  currency: data.currency || 'TND',
  total_rooms: Number(data.total_rooms || 20),
  checkin_time: data.checkin_time || '14:00',
  checkout_time: data.checkout_time || '12:00',
  meals: data.meals || null,
  availability: data.availability || 'Available',
  is_featured: data.is_featured === true,
  display_order: Number(data.display_order || 0),
  is_active: data.is_active !== false,
});

const create = async (data) => {
  const payload = serializeHotelPayload(data);
  const { rows } = await pool.query(
    `INSERT INTO public.hotels_catalog (
      name, subtitle, city, address, description, image_url,
      gallery, highlights, room_types, meal_plans, room_views, reservation_extras,
      policies, nearby_places, amenities,
      property_type, badge, stars, rating, reviews, base_price, old_price,
      currency, total_rooms, checkin_time, checkout_time, meals,
      availability, is_featured, display_order, is_active
    ) VALUES (
      $1,$2,$3,$4,$5,$6,
      $7,$8,$9,$10,$11,$12,
      $13,$14,$15,$16,$17,$18,$19,$20,$21,
      $22,$23,$24,$25,$26,
      $27,$28,$29,$30,$31
    )
    RETURNING *`,
    [
      payload.name,
      payload.subtitle,
      payload.city,
      payload.address,
      payload.description,
      payload.image_url,
      payload.gallery,
      payload.highlights,
      payload.room_types,
      payload.meal_plans,
      payload.room_views,
      payload.reservation_extras,
      payload.policies,
      payload.nearby_places,
      payload.amenities,
      payload.property_type,
      payload.badge,
      payload.stars,
      payload.rating,
      payload.reviews,
      payload.base_price,
      payload.old_price,
      payload.currency,
      payload.total_rooms,
      payload.checkin_time,
      payload.checkout_time,
      payload.meals,
      payload.availability,
      payload.is_featured,
      payload.display_order,
      payload.is_active,
    ]
  );
  return normalizeRow(rows[0]);
};

const update = async (id, data) => {
  const payload = serializeHotelPayload(data);
  const { rows } = await pool.query(
    `UPDATE public.hotels_catalog SET
      name = $2,
      subtitle = $3,
      city = $4,
      address = $5,
      description = $6,
      image_url = $7,
      gallery = $8,
      highlights = $9,
      room_types = $10,
      meal_plans = $11,
      room_views = $12,
      reservation_extras = $13,
      policies = $14,
      nearby_places = $15,
      amenities = $16,
      property_type = $17,
      badge = $18,
      stars = $19,
      rating = $20,
      reviews = $21,
      base_price = $22,
      old_price = $23,
      currency = $24,
      total_rooms = $25,
      checkin_time = $26,
      checkout_time = $27,
      meals = $28,
      availability = $29,
      is_featured = $30,
      display_order = $31,
      is_active = $32,
      updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      payload.name,
      payload.subtitle,
      payload.city,
      payload.address,
      payload.description,
      payload.image_url,
      payload.gallery,
      payload.highlights,
      payload.room_types,
      payload.meal_plans,
      payload.room_views,
      payload.reservation_extras,
      payload.policies,
      payload.nearby_places,
      payload.amenities,
      payload.property_type,
      payload.badge,
      payload.stars,
      payload.rating,
      payload.reviews,
      payload.base_price,
      payload.old_price,
      payload.currency,
      payload.total_rooms,
      payload.checkin_time,
      payload.checkout_time,
      payload.meals,
      payload.availability,
      payload.is_featured,
      payload.display_order,
      payload.is_active,
    ]
  );
  return rows[0] ? normalizeRow(rows[0]) : null;
};

const remove = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM public.hotels_catalog WHERE id = $1', [id]);
  return rowCount > 0;
};

const count = async () => {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM public.hotels_catalog');
  return rows[0]?.total || 0;
};

module.exports = {
  getSetting,
  setSetting,
  getPublicHotels,
  getAdminHotels,
  getPopularHotels,
  getById,
  create,
  update,
  remove,
  count,
};
