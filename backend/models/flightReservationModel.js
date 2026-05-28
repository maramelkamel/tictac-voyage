const pool = require('../config/db');

const create = async (data) => {
  const {
    user_id,
    duffel_order_id,
    offer_id,
    origin_iata,
    destination_iata,
    airline_name,
    flight_number,
    departing_at,
    arriving_at,
    cabin_class = 'economy',
    total_price,
    currency = 'TND',
    passengers,
    status = 'pending',
    payment_status = 'pending',
    payment_method = 'agency',
    notes = null,
  } = data;

  const result = await pool.query(
    `INSERT INTO public.flight_reservations
       (user_id, duffel_order_id, offer_id, origin_iata, destination_iata, airline_name, flight_number, departing_at, arriving_at, cabin_class, total_price, currency, passengers, status, payment_status, payment_method, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
     RETURNING *`,
    [
      user_id,
      duffel_order_id,
      offer_id,
      origin_iata || null,
      destination_iata || null,
      airline_name || null,
      flight_number || null,
      departing_at || null,
      arriving_at || null,
      cabin_class,
      total_price,
      currency,
      JSON.stringify(passengers || []),
      status,
      payment_status,
      payment_method,
      notes,
    ]
  );
  return result.rows[0];
};

const findByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM public.flight_reservations
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query(
    `SELECT fr.*, c.first_name AS client_first_name, c.last_name AS client_last_name, c.email AS client_email, c.phone AS client_phone
     FROM public.flight_reservations fr
     LEFT JOIN public.clients c ON c.id = fr.user_id
     WHERE fr.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const updateStatus = async (id, status, paymentStatus = null) => {
  const result = paymentStatus
    ? await pool.query(
        `UPDATE public.flight_reservations
         SET status = $1, payment_status = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [status, paymentStatus, id]
      )
    : await pool.query(
        `UPDATE public.flight_reservations
         SET status = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [status, id]
      );

  return result.rows[0] || null;
};

const getAllForAdmin = async () => {
  const result = await pool.query(
    `SELECT fr.*, c.email AS client_email, c.first_name AS client_first_name, c.last_name AS client_last_name, c.phone AS client_phone
     FROM public.flight_reservations fr
     LEFT JOIN public.clients c ON c.id = fr.user_id
     ORDER BY fr.created_at DESC`
  );
  return result.rows;
};

module.exports = { create, findByUserId, findById, updateStatus, getAllForAdmin };
