// backend/models/favoritesModel.js
const pool = require('../config/db');

const getByClient = async (clientId, type) => {
  const query = type
    ? `SELECT * FROM public.favorites WHERE client_id=$1 AND item_type=$2 ORDER BY created_at DESC`
    : `SELECT * FROM public.favorites WHERE client_id=$1 ORDER BY created_at DESC`;
  const params = type ? [clientId, type] : [clientId];
  const { rows } = await pool.query(query, params);
  return rows;
};

const toggle = async (clientId, itemType, itemId, itemData) => {
  // Check if exists
  const { rows: existing } = await pool.query(
    `SELECT id FROM public.favorites WHERE client_id=$1 AND item_type=$2 AND item_id=$3`,
    [clientId, itemType, itemId]
  );
  if (existing.length > 0) {
    // Remove
    await pool.query(`DELETE FROM public.favorites WHERE client_id=$1 AND item_type=$2 AND item_id=$3`,
      [clientId, itemType, itemId]);
    return { action: 'removed' };
  } else {
    // Add
    await pool.query(
      `INSERT INTO public.favorites (client_id, item_type, item_id, item_data) VALUES ($1,$2,$3,$4)`,
      [clientId, itemType, itemId, JSON.stringify(itemData || {})]
    );
    return { action: 'added' };
  }
};

const isFavorite = async (clientId, itemType, itemId) => {
  const { rows } = await pool.query(
    `SELECT id FROM public.favorites WHERE client_id=$1 AND item_type=$2 AND item_id=$3`,
    [clientId, itemType, itemId]
  );
  return rows.length > 0;
};

module.exports = { getByClient, toggle, isFavorite };