const pool = require('../config/db');

const CATEGORIES = ['omra','hotels','vols','circuits','voyages_internationaux'];

function validate(body) {
  const { titre, categorie, type_reduction, valeur_reduction, date_debut, date_fin } = body;
  if (!titre || !titre.trim())              return 'Le titre est obligatoire.';
  if (!CATEGORIES.includes(categorie))      return 'Catégorie invalide.';
  if (!['pourcentage','montant_fixe'].includes(type_reduction))
                                            return 'Type de réduction invalide.';
  const val = parseFloat(valeur_reduction);
  if (isNaN(val) || val <= 0)              return 'La valeur doit être un nombre positif.';
  if (type_reduction === 'pourcentage' && val > 100)
                                            return 'Un pourcentage ne peut pas dépasser 100.';
  if (new Date(date_fin) <= new Date(date_debut))
                                            return 'La date de fin doit être après la date de début.';
  return null;
}

exports.getAll = async (req, res) => {
  try {
    const { categorie, is_active } = req.query;
    let query = 'SELECT * FROM promotions WHERE 1=1';
    const params = [];
    if (categorie) {
      params.push(categorie);
      query += ` AND categorie = $${params.length}`;
    }
    if (is_active !== undefined) {
      params.push(is_active === 'true');
      query += ` AND is_active = $${params.length}`;
    }
    query += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAccueil = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM promotions
       WHERE afficher_accueil = true
         AND is_active = true
         AND date_debut <= CURRENT_DATE
         AND date_fin   >= CURRENT_DATE
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByCategorie = async (req, res) => {
  try {
    const { categorie } = req.params;
    if (!CATEGORIES.includes(categorie))
      return res.status(400).json({ error: 'Catégorie invalide.' });
    const { rows } = await pool.query(
      `SELECT * FROM promotions
       WHERE categorie  = $1
         AND is_active  = true
         AND date_debut <= CURRENT_DATE
         AND date_fin   >= CURRENT_DATE
       ORDER BY created_at DESC`,
      [categorie]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const err = validate(req.body);
    if (err) return res.status(400).json({ error: err });
    const {
      titre, description, categorie, type_reduction, valeur_reduction,
      code_promo, date_debut, date_fin, is_active, afficher_accueil,
      display_mode, image_url,
    } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO promotions
         (titre, description, categorie, type_reduction, valeur_reduction,
          code_promo, date_debut, date_fin, is_active, afficher_accueil,
          display_mode, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        titre, description || null, categorie, type_reduction,
        valeur_reduction, code_promo || null, date_debut, date_fin,
        is_active ?? true, afficher_accueil ?? false,
        display_mode || 'card', image_url || null,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const err = validate(req.body);
    if (err) return res.status(400).json({ error: err });
    const {
      titre, description, categorie, type_reduction, valeur_reduction,
      code_promo, date_debut, date_fin, is_active, afficher_accueil,
      display_mode, image_url,
    } = req.body;
    const { rows } = await pool.query(
      `UPDATE promotions SET
         titre=$1, description=$2, categorie=$3, type_reduction=$4,
         valeur_reduction=$5, code_promo=$6, date_debut=$7, date_fin=$8,
         is_active=$9, afficher_accueil=$10, display_mode=$11,
         image_url=$12, updated_at=NOW()
       WHERE id=$13 RETURNING *`,
      [
        titre, description || null, categorie, type_reduction,
        valeur_reduction, code_promo || null, date_debut, date_fin,
        is_active, afficher_accueil, display_mode || 'card',
        image_url || null, req.params.id,
      ]
    );
    if (!rows.length) return res.status(404).json({ error: 'Promotion introuvable.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggle = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE promotions SET is_active = NOT is_active, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Promotion introuvable.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM promotions WHERE id = $1', [req.params.id]);
    res.json({ message: 'Supprimé avec succès.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};