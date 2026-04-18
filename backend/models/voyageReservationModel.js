// backend/models/voyageReservationModel.js
const pool = require('../config/db');

const getAllReservations = async ({ status, payment_method, email } = {}) => {
  // Construction dynamique de la requête selon les filtres reçus depuis l'admin.
  let q = `
    SELECT r.*, v.title AS voyage_title, v.pays, v.destination
    FROM public.voyage_reservations r
    LEFT JOIN public.voyages_organises v ON v.id = r.voyage_id
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
  // Charge la réservation et enrichit la réponse avec des infos du voyage lié.
  const { rows } = await pool.query(`
    SELECT r.*, v.title AS voyage_title, v.pays, v.destination
    FROM public.voyage_reservations r
    LEFT JOIN public.voyages_organises v ON v.id = r.voyage_id
    WHERE r.id = $1
  `, [id]);
  return rows[0] || null;
};

const createReservation = async (data) => {
  // Enregistre seulement la réservation confirmée par le client,
  // pas l'offre affichée à l'écran.
  const { voyage_id, first_name, last_name, email, phone, chambre_type, number_of_persons, total_price, payment_method, notes } = data;
  const { rows } = await pool.query(`
    INSERT INTO public.voyage_reservations
      (voyage_id, first_name, last_name, email, phone, chambre_type, number_of_persons, total_price, payment_method, notes)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *
  `, [voyage_id||null, first_name, last_name, email, phone||null, chambre_type||'double', number_of_persons||1, total_price, payment_method||'agency', notes||null]);
  return rows[0];
};

// Mise à jour du statut avec récupération du titre du voyage lié
// pour alimenter l'email envoyé au client.
const updateStatus = async (id, status) => {
  const { rows } = await pool.query(`
    UPDATE public.voyage_reservations
    SET    status = $1, updated_at = NOW()
    WHERE  id = $2
    RETURNING *,
      (SELECT title FROM public.voyages_organises WHERE id = voyage_id) AS voyage_title
  `, [status, id]);
  return rows[0] || null;
};

const deleteReservation = async (id) => {
  // Suppression d'une réservation.
  const { rows } = await pool.query(
    'DELETE FROM public.voyage_reservations WHERE id=$1 RETURNING id', [id]
  );
  return rows[0] || null;
};

const getStats = async () => {
  // Agrégats simples pour les compteurs du back-office.
  const { rows } = await pool.query(`
    SELECT
      COUNT(*)::int                                           AS total,
      COUNT(*) FILTER (WHERE status='pending')::int          AS pending,
      COUNT(*) FILTER (WHERE status='confirmed')::int        AS confirmed,
      COUNT(*) FILTER (WHERE status='completed')::int        AS completed,
      COUNT(*) FILTER (WHERE status='cancelled')::int        AS cancelled,
      COUNT(*) FILTER (WHERE payment_method='online')::int   AS online_payments,
      COUNT(*) FILTER (WHERE payment_method='agency')::int   AS agency_payments
    FROM public.voyage_reservations
  `);
  return rows[0];
};

module.exports = { getAllReservations, getReservationById, createReservation, updateStatus, deleteReservation, getStats };
