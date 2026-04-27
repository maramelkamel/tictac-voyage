// backend/models/voyageOrganiseModel.js
const pool = require('../config/db');

const BASE_QUERY = `
  SELECT v.*,
    COALESCE(COUNT(r.id), 0)::int AS reservation_count,
    GREATEST(
      v.spots - COALESCE(COUNT(r.id) FILTER (WHERE r.status = 'confirmed'), 0),
      0
    )::int AS available_spots
  FROM public.voyages_organises v
  LEFT JOIN public.voyage_reservations r ON r.voyage_id = v.id
`;

// ── Settings (voyage-covers) ──────────────────────────────────
// La table settings est partagée avec les circuits (circuit-covers).
// CREATE TABLE IF NOT EXISTS garantit qu'elle n'est créée qu'une seule fois.

const ensureTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.settings (
      key        VARCHAR(100) PRIMARY KEY,
      value      JSONB        NOT NULL,
      updated_at TIMESTAMPTZ  DEFAULT NOW()
    )
  `);
};

const getSetting = async (key) => {
  await ensureTable();
  const { rows } = await pool.query(
    'SELECT value FROM public.settings WHERE key = $1',
    [key]
  );
  return rows[0]?.value ?? null;
};

const setSetting = async (key, value) => {
  await ensureTable();
  const { rows } = await pool.query(
    `INSERT INTO public.settings (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
     RETURNING value`,
    [key, JSON.stringify(value)]
  );
  return rows[0].value;
};

// ── Voyages ───────────────────────────────────────────────────

const getAllVoyages = async () => {
  const { rows } = await pool.query(
    BASE_QUERY + ' GROUP BY v.id ORDER BY v.created_at DESC'
  );
  return rows;
};

const getActiveVoyages = async () => {
  const { rows } = await pool.query(
    BASE_QUERY + ' WHERE v.is_active = true GROUP BY v.id ORDER BY v.created_at DESC'
  );
  return rows;
};

const getVoyageById = async (id) => {
  const { rows } = await pool.query(
    BASE_QUERY + ' WHERE v.id = $1 GROUP BY v.id',
    [id]
  );
  return rows[0] || null;
};

const createVoyage = async (data) => {
  const {
    title, subtitle, description, image_url, price, old_price,
    duration, departure, spots, rating, reviews, badge,
    pays, destination, continent, saison, budget, categorie,
    programme, inclus, non_inclus, is_active,
  } = data;

  const { rows } = await pool.query(`
    INSERT INTO public.voyages_organises
      (title, subtitle, description, image_url, price, old_price,
       duration, departure, spots, rating, reviews, badge,
       pays, destination, continent, saison, budget, categorie,
       programme, inclus, non_inclus, is_active)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
    RETURNING *
  `, [
    title, subtitle || null, description || null, image_url || null,
    price, old_price || null, duration, departure || null,
    spots || 30, rating || 5.0, reviews || 0, badge || null,
    pays || null, destination || null, continent || null,
    saison || null, budget || null, categorie || null,
    JSON.stringify(programme  || []),
    JSON.stringify(inclus     || []),
    JSON.stringify(non_inclus || []),
    is_active !== false,
  ]);
  return rows[0];
};

const updateVoyage = async (id, data) => {
  const {
    title, subtitle, description, image_url, price, old_price,
    duration, departure, spots, rating, reviews, badge,
    pays, destination, continent, saison, budget, categorie,
    programme, inclus, non_inclus, is_active,
  } = data;

  const { rows } = await pool.query(`
    UPDATE public.voyages_organises SET
      title=$1, subtitle=$2, description=$3, image_url=$4,
      price=$5, old_price=$6, duration=$7, departure=$8,
      spots=$9, rating=$10, reviews=$11, badge=$12,
      pays=$13, destination=$14, continent=$15, saison=$16,
      budget=$17, categorie=$18, programme=$19, inclus=$20,
      non_inclus=$21, is_active=$22
    WHERE id=$23 RETURNING *
  `, [
    title, subtitle || null, description || null, image_url || null,
    price, old_price || null, duration, departure || null,
    spots || 30, rating || 5.0, reviews || 0, badge || null,
    pays || null, destination || null, continent || null,
    saison || null, budget || null, categorie || null,
    JSON.stringify(programme  || []),
    JSON.stringify(inclus     || []),
    JSON.stringify(non_inclus || []),
    is_active !== false, id,
  ]);
  return rows[0] || null;
};

const deleteVoyage = async (id) => {
  const { rows } = await pool.query(
    'DELETE FROM public.voyages_organises WHERE id=$1 RETURNING id',
    [id]
  );
  return rows[0] || null;
};

module.exports = {
  getAllVoyages, getActiveVoyages, getVoyageById,
  createVoyage, updateVoyage, deleteVoyage,
  getSetting, setSetting,
};