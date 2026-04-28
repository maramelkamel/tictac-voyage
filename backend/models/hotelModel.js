const pool = require('../config/db');

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
  amenities: parseJson(row.amenities, []),
});

const getAll = async ({ city, search } = {}) => {
  const conditions = ['is_active = true'];
  const values = [];

  if (city) {
    values.push(city.trim().toLowerCase());
    conditions.push(`LOWER(city) = $${values.length}`);
  }

  if (search) {
    values.push(`%${search.trim().toLowerCase()}%`);
    conditions.push(`(
      LOWER(name) LIKE $${values.length}
      OR LOWER(city) LIKE $${values.length}
      OR LOWER(COALESCE(address, '')) LIKE $${values.length}
    )`);
  }

  const { rows } = await pool.query(
    `SELECT *
     FROM public.hotels_catalog
     WHERE ${conditions.join(' AND ')}
     ORDER BY city ASC, name ASC`,
    values
  );

  return rows.map(normalizeRow);
};

const getById = async (id) => {
  const { rows } = await pool.query(
    `SELECT * FROM public.hotels_catalog WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ? normalizeRow(rows[0]) : null;
};

const create = async ({
  name,
  city,
  address = null,
  description = null,
  image_url = null,
  rating = null,
  amenities = [],
  base_price = null,
  currency = 'USD',
  availability = 'Available',
}) => {
  const { rows } = await pool.query(
    `INSERT INTO public.hotels_catalog
      (name, city, address, description, image_url, rating, amenities, base_price, currency, availability)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      name,
      city,
      address,
      description,
      image_url,
      rating,
      JSON.stringify(amenities || []),
      base_price,
      currency,
      availability,
    ]
  );

  return normalizeRow(rows[0]);
};

const update = async (
  id,
  {
    name,
    city,
    address = null,
    description = null,
    image_url = null,
    rating = null,
    amenities = [],
    base_price = null,
    currency = 'USD',
    availability = 'Available',
    is_active = true,
  }
) => {
  const { rows } = await pool.query(
    `UPDATE public.hotels_catalog
     SET
       name = $2,
       city = $3,
       address = $4,
       description = $5,
       image_url = $6,
       rating = $7,
       amenities = $8,
       base_price = $9,
       currency = $10,
       availability = $11,
       is_active = $12,
       updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      name,
      city,
      address,
      description,
      image_url,
      rating,
      JSON.stringify(amenities || []),
      base_price,
      currency,
      availability,
      is_active,
    ]
  );

  return rows[0] ? normalizeRow(rows[0]) : null;
};

const remove = async (id) => {
  const { rowCount } = await pool.query(
    `DELETE FROM public.hotels_catalog WHERE id = $1`,
    [id]
  );
  return rowCount > 0;
};

const count = async () => {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS total FROM public.hotels_catalog`);
  return rows[0]?.total || 0;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  count,
};
