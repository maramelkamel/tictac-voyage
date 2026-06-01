// backend/routes/adminStatsRoutes.js
const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

//  retourne un défaut si la table n'existe pas
const safe = async (query, params = []) => {
  try {
    const { rows } = await pool.query(query, params);
    return rows;
  } catch (e) {
    console.warn('[AdminStats] Requête ignorée:', e.message);
    return [];
  }
};

const safeOne = async (query, params = []) => {
  const rows = await safe(query, params);
  return rows[0] || {};
};

router.get('/', async (req, res) => {
  try {
    //  Détection dynamique des tables présentes 
    const { rows: tables } = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    const has = (name) => tables.some(t => t.table_name === name);

    // ── 1. Clients ──
    const clients = await safeOne(`
      SELECT
        COUNT(*)                                                         AS total,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS new_this_month,
        COUNT(*) FILTER (WHERE google_id IS NOT NULL)                   AS google_users
      FROM public.clients
    `);

    // ── 2. Construire l'union des réservations dynamiquement ──
    const resTables = [
      has('transport_requests')    && `SELECT status, created_at, 0::numeric AS price FROM public.transport_requests`,
      has('voyage_reservations')   && `SELECT status, created_at, COALESCE(total_price,0) FROM public.voyage_reservations`,
      has('circuit_reservations')  && `SELECT status, created_at, COALESCE(total_price,0) FROM public.circuit_reservations`,
      has('omra_reservations')     && `SELECT status, created_at, COALESCE(total_price,0) FROM public.omra_reservations`,
      has('flight_reservations')   && `SELECT status, created_at, COALESCE(total_price,0) FROM public.flight_reservations`,
      has('hotel_reservations')    && `SELECT status, created_at, COALESCE(total_price,0) FROM public.hotel_reservations`,
    ].filter(Boolean);

    let reservations = {};
    let revenue = { total: 0, this_month: 0 };

    if (resTables.length > 0) {
      const union = resTables.join(' UNION ALL ');

      reservations = await safeOne(`
        SELECT
          COUNT(*)                                                           AS total,
          COUNT(*) FILTER (WHERE status = 'pending')                        AS pending,
          COUNT(*) FILTER (WHERE status = 'confirmed')                      AS confirmed,
          COUNT(*) FILTER (WHERE status = 'completed')                      AS completed,
          COUNT(*) FILTER (WHERE status = 'cancelled')                      AS cancelled,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')  AS new_this_month
        FROM (${union}) all_res
      `);

      revenue = await safeOne(`
        SELECT
          COALESCE(SUM(price), 0)                                                             AS total,
          COALESCE(SUM(price) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days'), 0)    AS this_month
        FROM (
          SELECT price, created_at FROM (${union}) r
          WHERE status IN ('confirmed','completed')
        ) rev
      `);
    }

    //  Offres par catalogue
    const offers = {
      hotels:     has('hotels')             ? (await safeOne(`SELECT COUNT(*) AS n FROM public.hotels`)).n             : 0,
      voyages:    has('voyages_organises')  ? (await safeOne(`SELECT COUNT(*) AS n FROM public.voyages_organises`)).n  : 0,
      circuits:   has('circuits')           ? (await safeOne(`SELECT COUNT(*) AS n FROM public.circuits`)).n           : 0,
      omra:       has('omra_packages')      ? (await safeOne(`SELECT COUNT(*) AS n FROM public.omra_packages`)).n      : 0,
      transports: has('transports')         ? (await safeOne(`SELECT COUNT(*) AS n FROM public.transports`)).n         : 0,
    };

    //  Messages contact
    const contactTable = has('contact_messages') ? 'contact_messages'
      : has('contacts') ? 'contacts' : null;

    const contacts = contactTable ? await safeOne(`
      SELECT
        COUNT(*)                                                          AS total,
        COUNT(*) FILTER (WHERE status = 'nouveau' OR status IS NULL)     AS unread,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')  AS this_week
      FROM public.${contactTable}
    `) : { total: 0, unread: 0, this_week: 0 };

    //  Dernières réservations 
    const recentParts = [
      has('transport_requests')   && `SELECT 'Transport' AS source, id::text, CONCAT(first_name,' ',last_name) AS client_name, status, created_at, 0::numeric AS total_price FROM public.transport_requests`,
      has('voyage_reservations')  && `SELECT 'Voyage',  id::text, client_name, status, created_at, COALESCE(total_price,0) FROM public.voyage_reservations`,
      has('circuit_reservations') && `SELECT 'Circuit', id::text, client_name, status, created_at, COALESCE(total_price,0) FROM public.circuit_reservations`,
      has('omra_reservations')    && `SELECT 'Omra',    id::text, client_name, status, created_at, COALESCE(total_price,0) FROM public.omra_reservations`,
      has('flight_reservations')  && `SELECT 'Vol',     id::text, CONCAT(passenger_first_name,' ',passenger_last_name), status, created_at, COALESCE(total_price,0) FROM public.flight_reservations`,
      has('hotel_reservations')   && `SELECT 'Hotel',   id::text, client_name, status, created_at, COALESCE(total_price,0) FROM public.hotel_reservations`,
    ].filter(Boolean);

    const recentReservations = recentParts.length > 0
      ? await safe(`SELECT * FROM (${recentParts.join(' UNION ALL ')}) r ORDER BY created_at DESC LIMIT 5`)
      : [];

    // Réservations par module 
    const moduleParts = [
      has('transport_requests')   && `SELECT 'Transport' AS source FROM public.transport_requests`,
      has('voyage_reservations')  && `SELECT 'Voyage'             FROM public.voyage_reservations`,
      has('circuit_reservations') && `SELECT 'Circuit'            FROM public.circuit_reservations`,
      has('omra_reservations')    && `SELECT 'Omra'               FROM public.omra_reservations`,
      has('flight_reservations')  && `SELECT 'Vol'                FROM public.flight_reservations`,
      has('hotel_reservations')   && `SELECT 'Hotel'              FROM public.hotel_reservations`,
    ].filter(Boolean);

    const reservationsByModule = moduleParts.length > 0
      ? await safe(`SELECT source, COUNT(*) AS count FROM (${moduleParts.join(' UNION ALL ')}) t GROUP BY source ORDER BY count DESC`)
      : [];

    // Revenus par mois (6 mois) 
    const revParts = [
      has('voyage_reservations')  && `SELECT created_at, COALESCE(total_price,0) AS amount FROM public.voyage_reservations  WHERE status IN ('confirmed','completed')`,
      has('circuit_reservations') && `SELECT created_at, COALESCE(total_price,0)           FROM public.circuit_reservations WHERE status IN ('confirmed','completed')`,
      has('omra_reservations')    && `SELECT created_at, COALESCE(total_price,0)           FROM public.omra_reservations    WHERE status IN ('confirmed','completed')`,
      has('hotel_reservations')   && `SELECT created_at, COALESCE(total_price,0)           FROM public.hotel_reservations   WHERE status IN ('confirmed','completed')`,
      has('flight_reservations')  && `SELECT created_at, COALESCE(total_price,0)           FROM public.flight_reservations  WHERE status IN ('confirmed','completed')`,
    ].filter(Boolean);

    const revenueByMonth = revParts.length > 0 ? await safe(`
      SELECT
        TO_CHAR(month, 'Mon YY') AS label,
        COALESCE(SUM(amount), 0) AS revenue
      FROM generate_series(
        DATE_TRUNC('month', NOW()) - INTERVAL '5 months',
        DATE_TRUNC('month', NOW()),
        '1 month'
      ) AS month
      LEFT JOIN (${revParts.join(' UNION ALL ')}) rev_data
        ON DATE_TRUNC('month', rev_data.created_at) = month
      GROUP BY month ORDER BY month
    `) : [];
//reponse json final
    res.json({
      success: true,
      data: { clients, reservations, revenue, offers, contacts, recentReservations, reservationsByModule, revenueByMonth },
    });

  } catch (err) {
    console.error('[AdminStats FATAL]', err);
    res.status(500).json({ success: false, message: err.message });
  }
  
});

module.exports = router;