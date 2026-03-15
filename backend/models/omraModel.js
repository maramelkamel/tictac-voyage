// backend/models/omraModel.js
const pool = require('../config/db');

// ── Shared SQL fragment with available_spots ──────────────────────
// available_spots = total spots - confirmed reservations (min 0)
const SPOTS_QUERY = `
  SELECT p.*,
    COALESCE(COUNT(r.id), 0)::int AS reservation_count,
    GREATEST(
      p.spots - COALESCE(COUNT(r.id) FILTER (WHERE r.status = 'confirmed'), 0),
      0
    )::int AS available_spots
  FROM public.omra_packages p
  LEFT JOIN public.omra_reservations r ON r.package_id = p.id
`;

/* GET all packages (admin — includes inactive) */
const getAllPackages = async () => {
  const { rows } = await pool.query(`
    ${SPOTS_QUERY}
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `);
  return rows;
};

/* GET active packages only (public frontend) */
const getActivePackages = async () => {
  const { rows } = await pool.query(`
    ${SPOTS_QUERY}
    WHERE p.is_active = true
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `);
  return rows;
};

/* GET one package by id */
const getPackageById = async (id) => {
  const { rows } = await pool.query(`
    ${SPOTS_QUERY}
    WHERE p.id = $1
    GROUP BY p.id
  `, [id]);
  return rows[0] || null;
};

/* CREATE package */
const createPackage = async (data) => {
  const {
    title, subtitle, description, image_url,
    price, old_price, duration, departure,
    spots, rating, reviews, badge, includes, is_active,
  } = data;

  const { rows } = await pool.query(`
    INSERT INTO public.omra_packages
      (title, subtitle, description, image_url, price, old_price,
       duration, departure, spots, rating, reviews, badge, includes, is_active)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    RETURNING *
  `, [
    title,
    subtitle    || null,
    description || null,
    image_url   || null,
    price,
    old_price   || null,
    duration,
    departure   || null,
    spots       !== undefined ? spots   : 50,
    rating      !== undefined ? rating  : 5.0,
    reviews     !== undefined ? reviews : 0,
    badge       || null,
    JSON.stringify(includes || []),
    is_active   !== false,
  ]);
  return rows[0];
};

/* UPDATE package */
const updatePackage = async (id, data) => {
  const {
    title, subtitle, description, image_url,
    price, old_price, duration, departure,
    spots, rating, reviews, badge, includes, is_active,
  } = data;

  const { rows } = await pool.query(`
    UPDATE public.omra_packages SET
      title=$1, subtitle=$2, description=$3, image_url=$4,
      price=$5, old_price=$6, duration=$7, departure=$8,
      spots=$9, rating=$10, reviews=$11, badge=$12,
      includes=$13, is_active=$14, updated_at=NOW()
    WHERE id=$15
    RETURNING *
  `, [
    title,
    subtitle    || null,
    description || null,
    image_url   || null,
    price,
    old_price   || null,
    duration,
    departure   || null,
    spots,
    rating,
    reviews,
    badge       || null,
    JSON.stringify(includes || []),
    is_active   !== false,
    id,
  ]);
  return rows[0] || null;
};

/* DELETE package */
const deletePackage = async (id) => {
  const { rows } = await pool.query(
    'DELETE FROM public.omra_packages WHERE id=$1 RETURNING id', [id]
  );
  return rows[0] || null;
};

module.exports = {
  getAllPackages,
  getActivePackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
};