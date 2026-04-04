// backend/models/circuitReservationModel.js
const pool = require('../config/db');

const getAllReservations = async ({ status, payment_method, email } = {}) => {
  let q = `
    SELECT r.*, c.title AS circuit_title, c.region
    FROM public.circuit_reservations r
    LEFT JOIN public.circuits c ON c.id = r.circuit_id
    WHERE 1=1
  `;
  const vals = []; let i = 1;
  if (email)                              { q += ` AND LOWER(r.email) = LOWER($${i++})`;     vals.push(email); }
  if (status && status !== 'all')         { q += ` AND r.status = $${i++}`;                  vals.push(status); }
  if (payment_method && payment_method !== 'all') { q += ` AND r.payment_method = $${i++}`; vals.push(payment_method); }
  q += ' ORDER BY r.created_at DESC';
  const { rows } = await pool.query(q, vals);
  return rows;
};

const getReservationById = async (id) => {
  const { rows } = await pool.query(`
    SELECT r.*, c.title AS circuit_title
    FROM public.circuit_reservations r
    LEFT JOIN public.circuits c ON c.id = r.circuit_id
    WHERE r.id = $1
  `, [id]);
  return rows[0] || null;
};

const createReservation = async (data) => {
  const { circuit_id, first_name, last_name, email, phone, chambre_type, number_of_persons, total_price, payment_method, notes } = data;
  const { rows } = await pool.query(`
    INSERT INTO public.circuit_reservations
      (circuit_id, first_name, last_name, email, phone, chambre_type, number_of_persons, total_price, payment_method, notes)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *
  `, [circuit_id||null, first_name, last_name, email, phone||null, chambre_type||'double', number_of_persons||1, total_price, payment_method||'agency', notes||null]);
  return rows[0];
};

// ── BUG FIX: scalar subquery so circuit_title is present in the returned row
//    (plain RETURNING * on an UPDATE has no JOIN, so title was always undefined) ──
const updateStatus = async (id, status) => {
  const { rows } = await pool.query(`
    UPDATE public.circuit_reservations
    SET    status = $1, updated_at = NOW()
    WHERE  id = $2
    RETURNING *,
      (SELECT title FROM public.circuits WHERE id = circuit_id) AS circuit_title
  `, [status, id]);
  return rows[0] || null;
};

const deleteReservation = async (id) => {
  const { rows } = await pool.query(
    'DELETE FROM public.circuit_reservations WHERE id=$1 RETURNING id', [id]
  );
  return rows[0] || null;
};

const getStats = async () => {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*)::int                                          AS total,
      COUNT(*) FILTER (WHERE status='pending')::int         AS pending,
      COUNT(*) FILTER (WHERE status='confirmed')::int       AS confirmed,
      COUNT(*) FILTER (WHERE status='completed')::int       AS completed,
      COUNT(*) FILTER (WHERE status='cancelled')::int       AS cancelled
    FROM public.circuit_reservations
  `);
  return rows[0];
};

module.exports = { getAllReservations, getReservationById, createReservation, updateStatus, deleteReservation, getStats };