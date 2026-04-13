const pool = require('../config/db');

/**
 * Flight Reservation Model
 * Table: flight_reservation
 */

/**
 * Create a new flight reservation
 * @param {Object} data
 * @returns {Object} created reservation
 */
const create = async (data) => {
  const {
    user_id,
    duffel_order_id,
    offer_id,
    total_price,
    currency = 'EUR',
    passengers,
    status = 'pending',
    payment_status = 'pending',
  } = data;

  const result = await pool.query(
    `INSERT INTO flight_reservation
       (user_id, duffel_order_id, offer_id, total_price, currency, passengers, status, payment_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [user_id, duffel_order_id, offer_id, total_price, currency, JSON.stringify(passengers), status, payment_status]
  );
  return result.rows[0];
};

/**
 * Find all reservations for a user
 * @param {string} userId
 * @returns {Array}
 */
const findByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM flight_reservation
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

/**
 * Find a single reservation by id
 * @param {string} id
 * @returns {Object|null}
 */
const findById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM flight_reservation WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Update status (and optionally payment_status)
 * @param {string} id
 * @param {string} status
 * @param {string|null} paymentStatus
 * @returns {Object}
 */
const updateStatus = async (id, status, paymentStatus = null) => {
  let query;
  let params;

  if (paymentStatus) {
    query = `UPDATE flight_reservation
             SET status = $1, payment_status = $2, updated_at = NOW()
             WHERE id = $3
             RETURNING *`;
    params = [status, paymentStatus, id];
  } else {
    query = `UPDATE flight_reservation
             SET status = $1, updated_at = NOW()
             WHERE id = $2
             RETURNING *`;
    params = [status, id];
  }

  const result = await pool.query(query, params);
  return result.rows[0] || null;
};

/**
 * Get all flight reservations (admin)
 * @returns {Array}
 */
const getAllForAdmin = async () => {
  const result = await pool.query(
    `SELECT fr.*, c.email AS client_email, c.first_name, c.last_name
     FROM flight_reservation fr
     LEFT JOIN client c ON c.id = fr.user_id
     ORDER BY fr.created_at DESC`
  );
  return result.rows;
};

module.exports = { create, findByUserId, findById, updateStatus, getAllForAdmin };