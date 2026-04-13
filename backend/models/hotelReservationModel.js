const pool = require('../config/db');

/**
 * Hotel Reservation Model
 * Table: hotel_reservation
 */

/**
 * Create a new hotel reservation
 * @param {Object} data
 * @returns {Object} created reservation
 */
const create = async (data) => {
  const {
    user_id,
    hotelbeds_booking_reference,
    hotel_code,
    room_code,
    check_in_date,
    check_out_date,
    total_price,
    currency = 'EUR',
    guests,
    status = 'pending',
    payment_status = 'pending',
  } = data;

  const result = await pool.query(
    `INSERT INTO hotel_reservation
       (user_id, hotelbeds_booking_reference, hotel_code, room_code,
        check_in_date, check_out_date, total_price, currency, guests, status, payment_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      user_id, hotelbeds_booking_reference, hotel_code, room_code,
      check_in_date, check_out_date, total_price, currency,
      JSON.stringify(guests), status, payment_status,
    ]
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
    `SELECT * FROM hotel_reservation
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
    `SELECT * FROM hotel_reservation WHERE id = $1`,
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
    query = `UPDATE hotel_reservation
             SET status = $1, payment_status = $2, updated_at = NOW()
             WHERE id = $3
             RETURNING *`;
    params = [status, paymentStatus, id];
  } else {
    query = `UPDATE hotel_reservation
             SET status = $1, updated_at = NOW()
             WHERE id = $2
             RETURNING *`;
    params = [status, id];
  }

  const result = await pool.query(query, params);
  return result.rows[0] || null;
};

/**
 * Get all hotel reservations (admin)
 * @returns {Array}
 */
const getAllForAdmin = async () => {
  const result = await pool.query(
    `SELECT hr.*, c.email AS client_email, c.first_name, c.last_name
     FROM hotel_reservation hr
     LEFT JOIN client c ON c.id = hr.user_id
     ORDER BY hr.created_at DESC`
  );
  return result.rows;
};

module.exports = { create, findByUserId, findById, updateStatus, getAllForAdmin };