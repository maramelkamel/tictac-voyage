// backend/models/customTripModel.js
const db = require('../config/db');

/* ── Récupérer toutes les demandes ── */
const getAll = async () => {
  const { rows } = await db.query(
    `SELECT * FROM custom_trips ORDER BY created_at DESC`
  );
  return rows;
};

/* ── Récupérer une demande par ID ── */
const getById = async (id) => {
  const { rows } = await db.query(
    `SELECT * FROM custom_trips WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

/* ── Créer une demande ── */
const create = async (data) => {
  const {
    full_name, email, phone,
    destination, departure_date, return_date, number_of_persons, max_budget,
    include_hotel, hotel_category, room_type, pension,
    include_transport, transport_type, departure_city, luggage,
    include_guide, guide_language, guide_duration,
  } = data;

  const { rows } = await db.query(
    `INSERT INTO custom_trips (
      full_name, email, phone,
      destination, departure_date, return_date, number_of_persons, max_budget,
      include_hotel, hotel_category, room_type, pension,
      include_transport, transport_type, departure_city, luggage,
      include_guide, guide_language, guide_duration
    ) VALUES (
      $1,$2,$3,
      $4,$5,$6,$7,$8,
      $9,$10,$11,$12,
      $13,$14,$15,$16,
      $17,$18,$19
    ) RETURNING *`,
    [
      full_name || null, email || null, phone || null,
      destination, departure_date, return_date, number_of_persons, max_budget || null,
      include_hotel || false, hotel_category || null, room_type || null, pension || null,
      include_transport || false, transport_type || null, departure_city || null, luggage || null,
      include_guide || false, guide_language || null, guide_duration || null,
    ]
  );
  return rows[0];
};

/* ── Mettre à jour le statut ── */
const updateStatus = async (id, status, admin_notes) => {
  const { rows } = await db.query(
    `UPDATE custom_trips SET status = $1, admin_notes = COALESCE($2, admin_notes)
     WHERE id = $3 RETURNING *`,
    [status, admin_notes || null, id]
  );
  return rows[0] || null;
};

/* ── Supprimer une demande ── */
const remove = async (id) => {
  const { rowCount } = await db.query(
    `DELETE FROM custom_trips WHERE id = $1`,
    [id]
  );
  return rowCount > 0;
};

module.exports = { getAll, getById, create, updateStatus, remove };