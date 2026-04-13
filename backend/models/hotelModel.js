const pool = require('../config/db');

/**
 * Hotel Model — table `hotel` + `hotel_room`
 * Catalogue interne des hôtels Tictac Voyages
 */

/* ─── Helpers ─────────────────────────────────────────────────── */

/**
 * Transforme une ligne DB en objet propre pour le frontend
 */
const format = (row) => ({
  id:            row.id,
  code:          row.code,
  name:          row.name,
  city:          row.city,
  country:       row.country,
  address:       row.address,
  description:   row.description,
  category:      row.category,
  categoryName:  row.category_name,
  minRate:       parseFloat(row.min_rate) || 0,
  currency:      row.currency,
  rating:        parseFloat(row.rating)   || 0,
  reviews:       row.reviews_count        || 0,
  image:         row.image,
  images:        Array.isArray(row.images)  ? row.images  : (row.images  || []),
  amenities:     Array.isArray(row.amenities) ? row.amenities : (row.amenities || []),
  hotelbedsCode: row.hotelbeds_code || null,
  isActive:      row.is_active,
  createdAt:     row.created_at,
});

const formatRoom = (row) => ({
  id:        row.id,
  hotelId:   row.hotel_id,
  type:      row.type,
  beds:      row.beds,
  sizeM2:    row.size_m2,
  maxGuests: row.max_guests,
  price:     parseFloat(row.price) || 0,
  currency:  row.currency,
  rateKey:   row.rate_key || null,
  isActive:  row.is_active,
});

/* ─── Queries ─────────────────────────────────────────────────── */

/**
 * GET all active hotels (with optional filters)
 *
 * @param {Object} filters
 * @param {string}  [filters.city]
 * @param {number}  [filters.category]   - number of stars
 * @param {number}  [filters.maxPrice]
 * @param {string}  [filters.search]     - name or city ILIKE
 * @param {string}  [filters.sortBy]     - 'price_asc'|'price_desc'|'rating'|'recommended'
 * @param {number}  [filters.limit]
 * @param {number}  [filters.offset]
 * @returns {Array}
 */
const findAll = async (filters = {}) => {
  const { city, category, maxPrice, search, sortBy = 'recommended', limit = 50, offset = 0 } = filters;

  const params = [];
  const where  = ['h.is_active = true'];

  if (city && city !== 'Toutes') {
    params.push(city);
    where.push(`h.city = $${params.length}`);
  }

  if (category) {
    params.push(Number(category));
    where.push(`h.category = $${params.length}`);
  }

  if (maxPrice) {
    params.push(Number(maxPrice));
    where.push(`h.min_rate <= $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    where.push(`(h.name ILIKE $${params.length} OR h.city ILIKE $${params.length})`);
  }

  const ORDER = {
    price_asc:   'h.min_rate ASC NULLS LAST',
    price_desc:  'h.min_rate DESC NULLS LAST',
    rating:      'h.rating DESC NULLS LAST',
    recommended: 'h.rating DESC NULLS LAST, h.reviews_count DESC',
  };

  params.push(limit, offset);

  const sql = `
    SELECT h.*
    FROM hotel h
    WHERE ${where.join(' AND ')}
    ORDER BY ${ORDER[sortBy] || ORDER.recommended}
    LIMIT $${params.length - 1}
    OFFSET $${params.length}
  `;

  const { rows } = await pool.query(sql, params);
  return rows.map(format);
};

/**
 * Count active hotels (for pagination)
 */
const countAll = async (filters = {}) => {
  const { city, category, maxPrice, search } = filters;
  const params = [];
  const where  = ['is_active = true'];

  if (city && city !== 'Toutes') { params.push(city); where.push(`city = $${params.length}`); }
  if (category)  { params.push(Number(category)); where.push(`category = $${params.length}`); }
  if (maxPrice)  { params.push(Number(maxPrice)); where.push(`min_rate <= $${params.length}`); }
  if (search)    { params.push(`%${search}%`); where.push(`(name ILIKE $${params.length} OR city ILIKE $${params.length})`); }

  const { rows } = await pool.query(`SELECT COUNT(*) FROM hotel WHERE ${where.join(' AND ')}`, params);
  return parseInt(rows[0].count, 10);
};

/**
 * Find one hotel by internal code (e.g. HTL001)
 */
const findByCode = async (code) => {
  const { rows } = await pool.query('SELECT * FROM hotel WHERE code = $1 AND is_active = true', [code]);
  return rows[0] ? format(rows[0]) : null;
};

/**
 * Find one hotel by UUID
 */
const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM hotel WHERE id = $1', [id]);
  return rows[0] ? format(rows[0]) : null;
};

/**
 * Get all rooms for a hotel (by hotel code)
 */
const getRooms = async (code) => {
  const { rows } = await pool.query(
    `SELECT r.* FROM hotel_room r
     JOIN hotel h ON h.id = r.hotel_id
     WHERE h.code = $1 AND r.is_active = true
     ORDER BY r.price ASC`,
    [code]
  );
  return rows.map(formatRoom);
};

/**
 * Get all distinct cities
 */
const getCities = async () => {
  const { rows } = await pool.query(
    'SELECT DISTINCT city FROM hotel WHERE is_active = true ORDER BY city'
  );
  return rows.map(r => r.city);
};

/**
 * Admin — create hotel
 */
const create = async (data) => {
  const {
    code, name, city, country = 'Tunisie', address, description,
    category, category_name, min_rate, currency = 'TND',
    rating, reviews_count = 0, image, images = [], amenities = [],
    hotelbeds_code,
  } = data;

  const { rows } = await pool.query(
    `INSERT INTO hotel
       (code, name, city, country, address, description, category, category_name,
        min_rate, currency, rating, reviews_count, image, images, amenities, hotelbeds_code)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     RETURNING *`,
    [code, name, city, country, address, description, category, category_name,
     min_rate, currency, rating, reviews_count, image,
     JSON.stringify(images), JSON.stringify(amenities), hotelbeds_code]
  );
  return format(rows[0]);
};

/**
 * Admin — update hotel
 */
const update = async (code, data) => {
  const fields = [];
  const params = [];

  const allowed = ['name','city','country','address','description','category','category_name',
                   'min_rate','currency','rating','reviews_count','image','hotelbeds_code','is_active'];

  allowed.forEach(key => {
    if (data[key] !== undefined) {
      params.push(data[key]);
      fields.push(`${key} = $${params.length}`);
    }
  });

  if (data.images !== undefined) {
    params.push(JSON.stringify(data.images));
    fields.push(`images = $${params.length}`);
  }
  if (data.amenities !== undefined) {
    params.push(JSON.stringify(data.amenities));
    fields.push(`amenities = $${params.length}`);
  }

  if (fields.length === 0) return findByCode(code);

  params.push(code);
  const { rows } = await pool.query(
    `UPDATE hotel SET ${fields.join(', ')} WHERE code = $${params.length} RETURNING *`,
    params
  );
  return rows[0] ? format(rows[0]) : null;
};

/**
 * Admin — soft delete
 */
const deactivate = async (code) => {
  const { rows } = await pool.query(
    `UPDATE hotel SET is_active = false WHERE code = $1 RETURNING *`,
    [code]
  );
  return rows[0] ? format(rows[0]) : null;
};

module.exports = { findAll, countAll, findByCode, findById, getRooms, getCities, create, update, deactivate };