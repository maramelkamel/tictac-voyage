const pool = require('../config/db');

const parseJson = (value, fallback = []) => {
  if (!value) return fallback;
  if (Array.isArray(value) || typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeRow = (row) => ({
  ...row,
  selected_hotel: parseJson(row.selected_hotel, {}),
  applied_promotion: parseJson(row.applied_promotion, null),
  selected_extras: parseJson(row.selected_extras, []),
});

const create = async ({
  user_id,
  hotel_id = null,
  hotel_name,
  hotel_city,
  hotel_location,
  check_in,
  check_out,
  adults = 2,
  children = 0,
  rooms = 1,
  room_type = null,
  meal_plan = null,
  room_view = null,
  bed_preference = null,
  arrival_time = null,
  airport_transfer = false,
  selected_extras = [],
  total_price,
  currency = 'USD',
  promo_code = null,
  applied_promotion = null,
  payment_method = 'agency',
  status = 'pending',
  payment_status = 'pending',
  holder_first_name,
  holder_last_name,
  holder_email,
  holder_phone,
  special_requests = null,
  selected_hotel = {},
}) => {
  const { rows } = await pool.query(
    `INSERT INTO public.hotel_reservations
      (user_id, hotel_id, hotel_name, hotel_city, hotel_location, check_in, check_out, adults, children, rooms, room_type, meal_plan, room_view, bed_preference, arrival_time, airport_transfer, selected_extras, total_price, currency, promo_code, applied_promotion, payment_method, status, payment_status, holder_first_name, holder_last_name, holder_email, holder_phone, special_requests, selected_hotel)
     VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30)
     RETURNING *`,
    [
      user_id,
      hotel_id,
      hotel_name,
      hotel_city,
      hotel_location,
      check_in,
      check_out,
      adults,
      children,
      rooms,
      room_type,
      meal_plan,
      room_view,
      bed_preference,
      arrival_time,
      airport_transfer,
      JSON.stringify(selected_extras || []),
      total_price,
      currency,
      promo_code,
      JSON.stringify(applied_promotion || null),
      payment_method,
      status,
      payment_status,
      holder_first_name,
      holder_last_name,
      holder_email,
      holder_phone,
      special_requests,
      JSON.stringify(selected_hotel || {}),
    ]
  );

  return normalizeRow(rows[0]);
};

const findByUserId = async (userId) => {
  const { rows } = await pool.query(
    `SELECT *
     FROM public.hotel_reservations
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map(normalizeRow);
};

const getAllForAdmin = async () => {
  const { rows } = await pool.query(
    `SELECT hr.*, c.email AS client_email, c.first_name AS client_first_name, c.last_name AS client_last_name, c.phone AS client_phone
     FROM public.hotel_reservations hr
     LEFT JOIN public.clients c ON c.id = hr.user_id
     ORDER BY hr.created_at DESC`
  );
  return rows.map(normalizeRow);
};

const findById = async (id) => {
  const { rows } = await pool.query(
    `SELECT hr.*, c.email AS client_email, c.first_name AS client_first_name, c.last_name AS client_last_name, c.phone AS client_phone
     FROM public.hotel_reservations hr
     LEFT JOIN public.clients c ON c.id = hr.user_id
     WHERE hr.id = $1
     LIMIT 1`,
    [id]
  );
  return rows[0] ? normalizeRow(rows[0]) : null;
};

const updateStatus = async (id, status, paymentStatus = null) => {
  const { rows } = paymentStatus
    ? await pool.query(
        `UPDATE public.hotel_reservations
         SET status = $1, payment_status = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [status, paymentStatus, id]
      )
    : await pool.query(
        `UPDATE public.hotel_reservations
         SET status = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [status, id]
      );

  return rows[0] ? normalizeRow(rows[0]) : null;
};

module.exports = {
  create,
  findByUserId,
  getAllForAdmin,
  findById,
  updateStatus,
};
