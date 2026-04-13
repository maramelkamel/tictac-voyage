const pool = require('../config/db');

const BASE = `
  SELECT
    f.*,
    ao.name    AS origin_name,
    ao.city    AS origin_city_name,
    ad.name    AS destination_name,
    ad.city    AS destination_city_name,
    ad.country AS destination_country
  FROM public.flights f
  LEFT JOIN public.airports ao ON ao.iata_code = f.origin_iata
  LEFT JOIN public.airports ad ON ad.iata_code = f.destination_iata
`;

// ── Lecture vols ───────────────────────────────────────────────
const getFlights = async ({
  origin, destination, date,
  cabin  = 'economy',
  sort   = 'price',
  limit  = 12,
  offset = 0,
} = {}) => {
  let where  = 'WHERE f.is_active = true AND f.departure_time > NOW()';
  const params = [];
  let idx    = 1;

  if (origin)      { where += ` AND f.origin_iata = $${idx++}`;      params.push(origin.toUpperCase()); }
  if (destination) { where += ` AND f.destination_iata = $${idx++}`; params.push(destination.toUpperCase()); }
  if (date)        { where += ` AND DATE(f.departure_time) = $${idx++}`; params.push(date); }

  const orderMap = {
    price    : cabin === 'business' ? 'f.price_business ASC NULLS LAST'
             : cabin === 'first'    ? 'f.price_first ASC NULLS LAST'
             :                        'f.price_economy ASC NULLS LAST',
    duration : 'f.duration_minutes ASC',
    departure: 'f.departure_time ASC',
  };

  params.push(limit, offset);
  const query = `
    ${BASE}
    ${where}
    ORDER BY ${orderMap[sort] || orderMap.price}
    LIMIT $${idx++} OFFSET $${idx++}
  `;

  const { rows } = await pool.query(query, params);
  return rows;
};

const countFlights = async ({ origin, destination, date } = {}) => {
  let query    = `SELECT COUNT(*) FROM public.flights f WHERE f.is_active = true AND f.departure_time > NOW()`;
  const params = [];
  let idx      = 1;

  if (origin)      { query += ` AND f.origin_iata = $${idx++}`;      params.push(origin.toUpperCase()); }
  if (destination) { query += ` AND f.destination_iata = $${idx++}`; params.push(destination.toUpperCase()); }
  if (date)        { query += ` AND DATE(f.departure_time) = $${idx++}`; params.push(date); }

  const { rows } = await pool.query(query, params);
  return parseInt(rows[0].count, 10);
};

const getFlightById = async (id) => {
  const { rows } = await pool.query(
    BASE + ' WHERE f.id = $1 AND f.is_active = true',
    [id]
  );
  return rows[0] || null;
};

// ── Upsert vol ─────────────────────────────────────────────────
const upsertFlight = async (data) => {
  const {
    external_id, flight_number, airline, airline_logo,
    origin_iata, destination_iata, departure_time, arrival_time,
    duration_minutes, stops, aircraft_type,
    price_economy, price_business, price_first,
    seats_economy, seats_business, seats_first,
    baggage_included, source, flight_status,
  } = data;

  const { rows } = await pool.query(`
    INSERT INTO public.flights (
      external_id, flight_number, airline, airline_logo,
      origin_iata, destination_iata, departure_time, arrival_time,
      duration_minutes, stops, aircraft_type,
      price_economy, price_business, price_first,
      seats_economy, seats_business, seats_first,
      baggage_included, source, flight_status, last_synced_at
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
      $12,$13,$14,$15,$16,$17,$18,$19,$20, NOW()
    )
    ON CONFLICT (external_id) DO UPDATE SET
      price_economy   = EXCLUDED.price_economy,
      price_business  = EXCLUDED.price_business,
      price_first     = EXCLUDED.price_first,
      seats_economy   = EXCLUDED.seats_economy,
      seats_business  = EXCLUDED.seats_business,
      seats_first     = EXCLUDED.seats_first,
      flight_status   = EXCLUDED.flight_status,
      last_synced_at  = NOW(),
      updated_at      = NOW()
    RETURNING id
  `, [
    external_id, flight_number, airline, airline_logo,
    origin_iata, destination_iata, departure_time, arrival_time,
    duration_minutes, stops || 0, aircraft_type,
    price_economy || null, price_business || null, price_first || null,
    seats_economy || 150, seats_business || 24, seats_first || 0,
    baggage_included !== false,
    source || 'generated',
    flight_status || null,
  ]);

  return rows[0].id;
};

// ── Réservation ────────────────────────────────────────────────
const createReservation = async (data) => {
  const {
    flightId, cabinClass, passengers, totalPrice,
    guestName, guestEmail, guestPhone, passportNumber, notes,
  } = data;

  const { rows } = await pool.query(`
    INSERT INTO public.flight_reservations (
      flight_id, cabin_class, passengers, total_price,
      guest_name, guest_email, guest_phone, passport_number, notes
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
  `, [
    flightId, cabinClass, passengers, totalPrice,
    guestName, guestEmail || '', guestPhone || '',
    passportNumber || '', notes || '',
  ]);

  return rows[0];
};

const getAllReservations = async () => {
  const { rows } = await pool.query(`
    SELECT
      fr.*,
      f.flight_number,
      f.airline,
      f.origin_iata,
      f.destination_iata,
      f.departure_time,
      f.arrival_time
    FROM public.flight_reservations fr
    JOIN public.flights f ON f.id = fr.flight_id
    ORDER BY fr.created_at DESC
  `);
  return rows;
};

// ── Aéroports ──────────────────────────────────────────────────
const getAirports = async () => {
  const { rows } = await pool.query(
    'SELECT * FROM public.airports ORDER BY country, city'
  );
  return rows;
};

// ── Nettoyage vols passés ──────────────────────────────────────
const deleteOldFlights = async () => {
  const { rowCount } = await pool.query(
    `DELETE FROM public.flights WHERE departure_time < NOW() - INTERVAL '1 day'`
  );
  console.log(`[model] ${rowCount} vieux vols supprimés`);
};

module.exports = {
  getFlights,
  countFlights,
  getFlightById,
  upsertFlight,
  createReservation,
  getAllReservations,
  getAirports,
  deleteOldFlights,
};