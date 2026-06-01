const express = require('express');
const pool = require('./config/db');

const CONFIRMED_STATUS = 'confirmed';

const SOURCE_RESERVATIONS = [
  {
    name: 'voyage',
    table: 'voyage_reservations',
    userIdExpression: 'c.id',
    joinClient: 'LEFT JOIN public.clients c ON LOWER(c.email) = LOWER(r.email)',
  },
  {
    name: 'circuit',
    table: 'circuit_reservations',
    userIdExpression: 'c.id',
    joinClient: 'LEFT JOIN public.clients c ON LOWER(c.email) = LOWER(r.email)',
  },
  {
    name: 'omra',
    table: 'omra_reservations',
    userIdExpression: 'c.id',
    joinClient: 'LEFT JOIN public.clients c ON LOWER(c.email) = LOWER(r.email)',
  },
  {
    name: 'flight',
    table: 'flight_reservations',
    userIdExpression: 'r.user_id',
    joinClient: '',
  },
  {
    name: 'hotel',
    table: 'hotel_reservations',
    userIdExpression: 'r.user_id',
    joinClient: '',
  },
];

const tableExists = async (client, tableName) => {
  const { rows } = await client.query('SELECT to_regclass($1) AS table_name', [
    `public.${tableName}`,
  ]);
  return Boolean(rows[0] && rows[0].table_name);
};

const ensureSafetyTables = async (client) => {
  const [reservationsExists, paymentsExists] = await Promise.all([
    tableExists(client, 'reservations'),
    tableExists(client, 'payments'),
  ]);

  if (!reservationsExists || !paymentsExists) {
    throw new Error('Safety tables reservations and payments must exist before syncing');
  }
};

const normalizePaymentStatus = (reservationStatus, paymentStatus) => {
  if (paymentStatus) return paymentStatus;
  return reservationStatus === CONFIRMED_STATUS ? 'paid' : 'pending';
};

const insertSafetyReservation = async (client, reservation) => {
  const {
    user_id,
    status,
    total_price,
    payment_method,
    payment_status,
    created_at,
  } = reservation;

  if (!user_id) {
    return { skipped: true, reason: 'client_not_found' };
  }

  if (status !== CONFIRMED_STATUS) {
    return { skipped: true, reason: 'reservation_not_confirmed' };
  }

  const paymentStatus = normalizePaymentStatus(status, payment_status);
  const createdAt = created_at || new Date();

  const existing = await client.query(
    `SELECT r.id
     FROM public.reservations r
     INNER JOIN public.payments p ON p.reservation_id = r.id
     WHERE r.user_id = $1
       AND r.status = $2
       AND r.total_price = $3
       AND r.created_at = $4
       AND p.amount = $3
       AND p.method = $5
       AND p.status = $6
     LIMIT 1`,
    [user_id, status, total_price, createdAt, payment_method, paymentStatus]
  );

  if (existing.rows[0]) {
    return { skipped: true, reason: 'already_registered', reservation_id: existing.rows[0].id };
  }

  const { rows } = await client.query(
    `INSERT INTO public.reservations (user_id, status, total_price, created_at)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [user_id, status, total_price, createdAt]
  );

  const safetyReservation = rows[0];

  const payment = await client.query(
    `INSERT INTO public.payments (reservation_id, amount, method, status, created_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [safetyReservation.id, total_price, payment_method, paymentStatus, createdAt]
  );

  return {
    skipped: false,
    reservation: safetyReservation,
    payment: payment.rows[0],
  };
};

const registerConfirmedReservation = async (reservation) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await ensureSafetyTables(client);
    const result = await insertSafetyReservation(client, reservation);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getConfirmedSourceReservations = async (client, source) => {
  if (!(await tableExists(client, source.table))) return [];

  const { rows } = await client.query(
    `SELECT
       $1::text AS source,
       r.id AS source_id,
       ${source.userIdExpression} AS user_id,
       r.status,
       r.total_price,
       r.payment_method,
       r.payment_status,
       r.created_at
     FROM public.${source.table} r
     ${source.joinClient}
     WHERE r.status = $2
       AND r.total_price IS NOT NULL
       AND r.payment_method IS NOT NULL`,
    [source.name, CONFIRMED_STATUS]
  );

  return rows;
};

const syncConfirmedReservations = async () => {
  const client = await pool.connect();
  const summary = {
    inserted: 0,
    skipped: 0,
    sources: {},
  };

  try {
    await client.query('BEGIN');
    await ensureSafetyTables(client);

    for (const source of SOURCE_RESERVATIONS) {
      const sourceReservations = await getConfirmedSourceReservations(client, source);
      summary.sources[source.name] = {
        found: sourceReservations.length,
        inserted: 0,
        skipped: 0,
      };

      for (const reservation of sourceReservations) {
        const result = await insertSafetyReservation(client, reservation);

        if (result.skipped) {
          summary.skipped += 1;
          summary.sources[source.name].skipped += 1;
        } else {
          summary.inserted += 1;
          summary.sources[source.name].inserted += 1;
        }
      }
    }

    await client.query('COMMIT');
    return summary;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const createDataSafetyRouter = () => {
  const router = express.Router();

  router.post('/sync-confirmed', async (req, res) => {
    try {
      const summary = await syncConfirmedReservations();
      res.json({ success: true, data: summary });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  router.post('/register-confirmed', async (req, res) => {
    try {
      const result = await registerConfirmedReservation(req.body);
      res.status(result.skipped ? 200 : 201).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  return router;
};

if (require.main === module) {
  syncConfirmedReservations()
    .then((summary) => {
      console.log(JSON.stringify({ success: true, data: summary }, null, 2));
      return pool.end();
    })
    .catch((error) => {
      console.error(JSON.stringify({ success: false, message: error.message }, null, 2));
      return pool.end().finally(() => process.exit(1));
    });
}

module.exports = {
  createDataSafetyRouter,
  registerConfirmedReservation,
  syncConfirmedReservations,
};
