// backend/models/transportModel.js
const pool = require('../config/db');

// ─── CATALOGUE VÉHICULES ────────────────────────────────────────
const getAllTransports = async () => {
  const { rows } = await pool.query(
    'SELECT * FROM transports ORDER BY transport_type, transport_name'
  );
  return rows;
};

const getTransportById = async (id) => {
  const { rows } = await pool.query(
    'SELECT * FROM transports WHERE id = $1',
    [id]
  );
  return rows[0];
};

const createTransport = async (data) => {
  const {
    transport_name, transport_type, description,
    capacity_min, capacity_max,
    price_per_km, price_halfday, price_fullday,
    image_url, is_available
  } = data;

  const { rows } = await pool.query(
    `INSERT INTO transports
      (transport_name, transport_type, description,
       capacity_min, capacity_max,
       price_per_km, price_halfday, price_fullday,
       image_url, is_available)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [transport_name, transport_type, description,
     capacity_min, capacity_max,
     price_per_km, price_halfday, price_fullday,
     image_url, is_available ?? true]
  );
  return rows[0];
};

const updateTransport = async (id, data) => {
  const {
    transport_name, transport_type, description,
    capacity_min, capacity_max,
    price_per_km, price_halfday, price_fullday,
    image_url, is_available
  } = data;

  const { rows } = await pool.query(
    `UPDATE transports SET
      transport_name=$1, transport_type=$2, description=$3,
      capacity_min=$4, capacity_max=$5,
      price_per_km=$6, price_halfday=$7, price_fullday=$8,
      image_url=$9, is_available=$10
     WHERE id=$11 RETURNING *`,
    [transport_name, transport_type, description,
     capacity_min, capacity_max,
     price_per_km, price_halfday, price_fullday,
     image_url, is_available, id]
  );
  return rows[0];
};

const deleteTransport = async (id) => {
  const { rows } = await pool.query(
    'DELETE FROM transports WHERE id=$1 RETURNING *',
    [id]
  );
  return rows[0];
};

// ─── DEMANDES CLIENTS ───────────────────────────────────────────
const getAllRequests = async () => {
  const { rows } = await pool.query(
    'SELECT * FROM transport_requests ORDER BY created_at DESC'
  );
  return rows;
};

const getRequestById = async (id) => {
  const { rows } = await pool.query(
    'SELECT * FROM transport_requests WHERE id=$1',
    [id]
  );
  return rows[0];
};

const createRequest = async (data) => {
  const {
    service_type, trip_type, duration_type, number_of_days,
    departure_location, arrival_location,
    departure_date, departure_time,
    return_date, return_time, flight_train_number,
    vehicle_type, passengers, luggage, child_seat, accessibility,
    full_name, email, phone, free_text
  } = data;

  const { rows } = await pool.query(
    `INSERT INTO transport_requests
      (service_type, trip_type, duration_type, number_of_days,
       departure_location, arrival_location,
       departure_date, departure_time,
       return_date, return_time, flight_train_number,
       vehicle_type, passengers, luggage, child_seat, accessibility,
       full_name, email, phone, free_text)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
     RETURNING *`,
    [service_type, trip_type, duration_type, number_of_days || 1,
     departure_location, arrival_location,
     departure_date, departure_time,
     return_date || null, return_time || null, flight_train_number || null,
     vehicle_type, passengers, luggage, child_seat, accessibility,
     full_name, email, phone, free_text || null]
  );
  return rows[0];
};

const updateRequestStatus = async (id, status, admin_notes) => {
  const { rows } = await pool.query(
    `UPDATE transport_requests SET status=$1, admin_notes=$2 WHERE id=$3 RETURNING *`,
    [status, admin_notes, id]
  );
  return rows[0];
};

const deleteRequest = async (id) => {
  const { rows } = await pool.query(
    'DELETE FROM transport_requests WHERE id=$1 RETURNING *',
    [id]
  );
  return rows[0];
};

module.exports = {
  getAllTransports, getTransportById, createTransport, updateTransport, deleteTransport,
  getAllRequests, getRequestById, createRequest, updateRequestStatus, deleteRequest,
};