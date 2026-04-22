// backend/models/circuitModel.js
const pool = require('../config/db');

const BASE = `
  SELECT c.*,
    COALESCE(COUNT(r.id), 0)::int AS reservation_count,
    GREATEST(c.spots - COALESCE(COUNT(r.id) FILTER (WHERE r.status = 'confirmed'), 0), 0)::int AS available_spots
  FROM public.circuits c
  LEFT JOIN public.circuit_reservations r ON r.circuit_id = c.id
`;

// ── Settings (circuit-covers) ─────────────────────────────────

// ⚠️ ensureTable était absent dans ta version — getSetting/setSetting planteraient sans ça
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
  const { rows } = await pool.query('SELECT value FROM public.settings WHERE key = $1', [key]);
  return rows[0]?.value ?? null;
};

const setSetting = async (key, value) => {
  await ensureTable();
  const { rows } = await pool.query(`
    INSERT INTO public.settings (key, value, updated_at)
    VALUES ($1, $2, NOW())
    ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
    RETURNING value
  `, [key, JSON.stringify(value)]);
  return rows[0].value;
};

// ── Circuits ──────────────────────────────────────────────────

const getAllCircuits     = async () => { const { rows } = await pool.query(BASE + ' GROUP BY c.id ORDER BY c.region, c.created_at DESC'); return rows; };
const getActiveCircuits = async () => { const { rows } = await pool.query(BASE + ' WHERE c.is_active = true GROUP BY c.id ORDER BY c.region, c.created_at DESC'); return rows; };
const getCircuitById    = async (id) => { const { rows } = await pool.query(BASE + ' WHERE c.id = $1 GROUP BY c.id', [id]); return rows[0] || null; };

const createCircuit = async (data) => {
  const { title, subtitle, description, image_url, price, old_price, duration, nights, region, departure, spots, rating, reviews, badge, tag, tag_color, difficulty, group_size, highlights, programme, inclus, non_inclus, is_active } = data;
  const { rows } = await pool.query(`
    INSERT INTO public.circuits (title,subtitle,description,image_url,price,old_price,duration,nights,region,departure,spots,rating,reviews,badge,tag,tag_color,difficulty,group_size,highlights,programme,inclus,non_inclus,is_active)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23) RETURNING *`,
    [title, subtitle||null, description||null, image_url||null, price, old_price||null, duration, nights||duration-1, region||'nord', departure||null, spots||20, rating||5.0, reviews||0, badge||null, tag||null, tag_color||'teal', difficulty||'Facile', group_size||null,
     JSON.stringify(highlights||[]), JSON.stringify(programme||[]), JSON.stringify(inclus||[]), JSON.stringify(non_inclus||[]), is_active!==false]);
  return rows[0];
};

const updateCircuit = async (id, data) => {
  const { title, subtitle, description, image_url, price, old_price, duration, nights, region, departure, spots, rating, reviews, badge, tag, tag_color, difficulty, group_size, highlights, programme, inclus, non_inclus, is_active } = data;
  const { rows } = await pool.query(`
    UPDATE public.circuits SET title=$1,subtitle=$2,description=$3,image_url=$4,price=$5,old_price=$6,duration=$7,nights=$8,region=$9,departure=$10,spots=$11,rating=$12,reviews=$13,badge=$14,tag=$15,tag_color=$16,difficulty=$17,group_size=$18,highlights=$19,programme=$20,inclus=$21,non_inclus=$22,is_active=$23
    WHERE id=$24 RETURNING *`,
    [title, subtitle||null, description||null, image_url||null, price, old_price||null, duration, nights||duration-1, region||'nord', departure||null, spots||20, rating||5.0, reviews||0, badge||null, tag||null, tag_color||'teal', difficulty||'Facile', group_size||null,
     JSON.stringify(highlights||[]), JSON.stringify(programme||[]), JSON.stringify(inclus||[]), JSON.stringify(non_inclus||[]), is_active!==false, id]);
  return rows[0] || null;
};

const deleteCircuit = async (id) => { const { rows } = await pool.query('DELETE FROM public.circuits WHERE id=$1 RETURNING id', [id]); return rows[0] || null; };

module.exports = { getAllCircuits, getActiveCircuits, getCircuitById, createCircuit, updateCircuit, deleteCircuit, getSetting, setSetting };