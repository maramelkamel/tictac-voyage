// backend/models/contactModel.js
const db = require('../config/db');

// ── Récupérer tous les messages (tri du plus récent) ──────────────
const getAllMessages = async ({ status, sujet, search } = {}) => {
  const conditions = [];
  const values     = [];
  let   idx        = 1;

  if (status && status !== 'all') {
    conditions.push(`status = $${idx++}`);
    values.push(status);
  }
  if (sujet && sujet !== 'all') {
    conditions.push(`sujet = $${idx++}`);
    values.push(sujet);
  }
  if (search) {
    conditions.push(`(nom ILIKE $${idx} OR email ILIKE $${idx} OR message ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `
    SELECT * FROM contact_messages
    ${where}
    ORDER BY created_at DESC
  `;
  const { rows } = await db.query(query, values);
  return rows;
};

// ── Récupérer un message par id ───────────────────────────────────
const getMessageById = async (id) => {
  const { rows } = await db.query(
    'SELECT * FROM contact_messages WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

// ── Créer un message (formulaire client) ─────────────────────────
const createMessage = async ({ nom, email, telephone, sujet, message }) => {
  const { rows } = await db.query(
    `INSERT INTO contact_messages (nom, email, telephone, sujet, message)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [nom, email, telephone || null, sujet, message]
  );
  return rows[0];
};

// ── Changer le statut (admin) ─────────────────────────────────────
const updateStatus = async (id, status, admin_notes) => {
  const { rows } = await db.query(
    `UPDATE contact_messages
     SET status = $1, admin_notes = COALESCE($2, admin_notes), updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [status, admin_notes || null, id]
  );
  return rows[0] || null;
};

// ── Supprimer un message ──────────────────────────────────────────
const deleteMessage = async (id) => {
  const { rows } = await db.query(
    'DELETE FROM contact_messages WHERE id = $1 RETURNING id',
    [id]
  );
  return rows[0] || null;
};

// ── Stats pour le dashboard ───────────────────────────────────────
const getStats = async () => {
  const { rows } = await db.query(`
    SELECT
      COUNT(*)                                           AS total,
      COUNT(*) FILTER (WHERE status = 'nouveau')        AS nouveaux,
      COUNT(*) FILTER (WHERE status = 'repondu')        AS repondus,
      COUNT(*) FILTER (WHERE status = 'archive')        AS archives,
      COUNT(*) FILTER (WHERE sujet  = 'omra')           AS omra,
      COUNT(*) FILTER (WHERE sujet  = 'voyage')         AS voyage,
      COUNT(*) FILTER (WHERE sujet  = 'transport')      AS transport,
      COUNT(*) FILTER (WHERE sujet  = 'sur-mesure')     AS sur_mesure
    FROM contact_messages
  `);
  return rows[0];
};

module.exports = { getAllMessages, getMessageById, createMessage, updateStatus, deleteMessage, getStats };