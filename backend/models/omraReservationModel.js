// backend/models/omraReservationModel.js
const pool = require('../config/db');

/* GET all reservations with optional filters */
const getAllReservations = async ({ status, payment_method, search, email } = {}) => {
  let q = `
    SELECT r.*,
      p.title     AS package_title,
      p.duration  AS package_duration,
      p.departure AS package_departure
    FROM public.omra_reservations r
    LEFT JOIN public.omra_packages p ON p.id = r.package_id
    WHERE 1=1
  `;
  const vals = [];
  let i = 1;

  // ── email filter (client profile) ──────────────────────────────
  if (email) {
    q += ` AND LOWER(r.email) = LOWER($${i++})`;
    vals.push(email);
  }
  if (status && status !== 'all') {
    q += ` AND r.status = $${i++}`;
    vals.push(status);
  }
  if (payment_method && payment_method !== 'all') {
    q += ` AND r.payment_method = $${i++}`;
    vals.push(payment_method);
  }
  if (search) {
    q += ` AND (r.first_name ILIKE $${i} OR r.last_name ILIKE $${i} OR r.email ILIKE $${i})`;
    vals.push(`%${search}%`);
    i++;
  }

  q += ' ORDER BY r.created_at DESC';
  const { rows } = await pool.query(q, vals);
  return rows;
};

/* GET one reservation by id */
const getReservationById = async (id) => {
  const { rows } = await pool.query(`
    SELECT r.*, p.title AS package_title
    FROM public.omra_reservations r
    LEFT JOIN public.omra_packages p ON p.id = r.package_id
    WHERE r.id = $1
  `, [id]);
  return rows[0] || null;
};

/* CREATE reservation */
const createReservation = async (data) => {
  const {
    package_id, first_name, last_name, email, phone,
    gender, has_mahram, passport_number,
    chambre_type, number_of_persons, total_price,
    payment_method, notes,
  } = data;

  const { rows } = await pool.query(`
    INSERT INTO public.omra_reservations
      (package_id, first_name, last_name, email, phone,
       gender, has_mahram, passport_number,
       chambre_type, number_of_persons, total_price,
       payment_method, notes)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING *
  `, [
    package_id || null,
    first_name, last_name, email, phone, gender,
    has_mahram || null, passport_number,
    chambre_type || 'double',
    number_of_persons || 1,
    total_price,
    payment_method || 'agency',
    notes || null,
  ]);
  return rows[0];
};

/* UPDATE reservation status */
const updateStatus = async (id, status, payment_status) => {
  let q, vals;
  if (payment_status) {
    q    = 'UPDATE public.omra_reservations SET status=$1, payment_status=$2, updated_at=NOW() WHERE id=$3 RETURNING *';
    vals = [status, payment_status, id];
  } else {
    q    = 'UPDATE public.omra_reservations SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *';
    vals = [status, id];
  }
  const { rows } = await pool.query(q, vals);
  return rows[0] || null;
};

/* DELETE reservation */
const deleteReservation = async (id) => {
  const { rows } = await pool.query(
    'DELETE FROM public.omra_reservations WHERE id=$1 RETURNING id', [id]
  );
  return rows[0] || null;
};

/* GET stats */
const getStats = async () => {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*)::int                                           AS total,
      COUNT(*) FILTER (WHERE status = 'pending')::int        AS pending,
      COUNT(*) FILTER (WHERE status = 'confirmed')::int      AS confirmed,
      COUNT(*) FILTER (WHERE status = 'completed')::int      AS completed,
      COUNT(*) FILTER (WHERE status = 'cancelled')::int      AS cancelled,
      COUNT(*) FILTER (WHERE payment_method = 'online')::int AS online_payments,
      COUNT(*) FILTER (WHERE payment_method = 'agency')::int AS agency_payments,
      COUNT(*) FILTER (WHERE payment_status = 'paid')::int   AS paid
    FROM public.omra_reservations
  `);
  return rows[0];
};

module.exports = {
  getAllReservations, getReservationById, createReservation,
  updateStatus, deleteReservation, getStats,
};