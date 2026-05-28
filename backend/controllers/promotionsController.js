// backend/controllers/promotionsController.js
const pool                   = require('../config/db');   
const { sendPromotionEmail } = require('../utils/mailer');

const VALID_CATEGORIES = [
  'omra',
  'hotels',
  'vols',
  'circuits',
  'voyages_internationaux',
  'voyages_sur_mesure',
  'transfert_mise_a_disposition',
];
const VALID_TYPES      = ['pourcentage', 'montant_fixe'];
const VALID_DISPLAY    = ['card', 'banner'];

const normalizePromotionCategory = (categorie) => {
  switch (categorie) {
    case 'transport':
      return 'transfert_mise_a_disposition';
    default:
      return categorie;
  }
};

const getCategoryKeys = (categorie) => {
  switch (normalizePromotionCategory(categorie)) {
    case 'transfert_mise_a_disposition':
      return ['transfert_mise_a_disposition', 'transport'];
    default:
      return [normalizePromotionCategory(categorie)];
  }
};

/* ── GET /api/promotions ── */
const getAll = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM promotions ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('promotionsController.getAll:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* ── GET /api/promotions/accueil ── */
const getAccueil = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT * FROM promotions
      WHERE is_active = true AND afficher_accueil = true
        AND date_debut <= CURRENT_DATE AND date_fin >= CURRENT_DATE
      ORDER BY created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('promotionsController.getAccueil:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* ── GET /api/promotions/categorie/:categorie ── */
const getByCategorie = async (req, res) => {
  try {
    const categoryKeys = getCategoryKeys(req.params.categorie);
    const { rows } = await pool.query(`
      SELECT * FROM promotions
      WHERE categorie = ANY($1) AND is_active = true
        AND date_debut <= CURRENT_DATE AND date_fin >= CURRENT_DATE
      ORDER BY created_at DESC
    `, [categoryKeys]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('promotionsController.getByCategorie:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* ── POST /api/promotions ── (auto-blasts all clients when active) ── */
const create = async (req, res) => {
  try {
    const {
      titre, description, categorie, type_reduction, valeur_reduction,
      code_promo, date_debut, date_fin, is_active, afficher_accueil,
      display_mode, image_url,
    } = req.body;
    const normalizedCategory = normalizePromotionCategory(categorie);

    if (!titre || !categorie || !type_reduction || !valeur_reduction || !date_debut || !date_fin)
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    if (!VALID_CATEGORIES.includes(normalizedCategory))
      return res.status(400).json({ success: false, message: 'Catégorie invalide' });
    if (!VALID_TYPES.includes(type_reduction))
      return res.status(400).json({ success: false, message: 'Type de réduction invalide' });

    const isActive = is_active !== false;

    const { rows } = await pool.query(`
      INSERT INTO promotions
        (titre, description, categorie, type_reduction, valeur_reduction,
         code_promo, date_debut, date_fin, is_active, afficher_accueil, display_mode, image_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
    `, [
      titre, description || null, normalizedCategory, type_reduction, Number(valeur_reduction),
      code_promo || null, date_debut, date_fin,
      isActive, afficher_accueil === true,
      VALID_DISPLAY.includes(display_mode) ? display_mode : 'card',
      image_url || null,
    ]);

    const promotion = rows[0];

    // mail envoyé dés la création promo
    if (isActive) {
      _blastPromotion(promotion).catch(err =>
        console.error('❌ Auto-blast on create failed:', err.message)
      );
    }

    res.status(201).json({ success: true, data: promotion });
  } catch (err) {
    console.error('promotionsController.create:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* ── PUT /api/promotions/:id ── */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titre, description, categorie, type_reduction, valeur_reduction,
      code_promo, date_debut, date_fin, is_active, afficher_accueil,
      display_mode, image_url,
    } = req.body;
    const normalizedCategory = normalizePromotionCategory(categorie);

    if (!VALID_CATEGORIES.includes(normalizedCategory))
      return res.status(400).json({ success: false, message: 'CatÃ©gorie invalide' });
    if (!VALID_TYPES.includes(type_reduction))
      return res.status(400).json({ success: false, message: 'Type de rÃ©duction invalide' });

    const { rows } = await pool.query(`
      UPDATE promotions SET
        titre=$1, description=$2, categorie=$3, type_reduction=$4,
        valeur_reduction=$5, code_promo=$6, date_debut=$7, date_fin=$8,
        is_active=$9, afficher_accueil=$10, display_mode=$11, image_url=$12,
        updated_at=NOW()
      WHERE id=$13 RETURNING *
    `, [
      titre, description || null, normalizedCategory, type_reduction, Number(valeur_reduction),
      code_promo || null, date_debut, date_fin,
      is_active !== false, afficher_accueil === true,
      VALID_DISPLAY.includes(display_mode) ? display_mode : 'card',
      image_url || null, id,
    ]);
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Promotion introuvable' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('promotionsController.update:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* ── PATCH /api/promotions/:id/toggle ── */
const toggle = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      UPDATE promotions SET is_active = NOT is_active, updated_at=NOW()
      WHERE id=$1 RETURNING *
    `, [req.params.id]);
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Promotion introuvable' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('promotionsController.toggle:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* ── DELETE /api/promotions/:id ── */
const remove = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM promotions WHERE id=$1 RETURNING id', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Promotion introuvable' });
    res.json({ success: true, message: 'Promotion supprimée' });
  } catch (err) {
    console.error('promotionsController.remove:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* ── POST /api/promotions/:id/send-blast  (manual trigger) ── */
const sendBlast = async (req, res) => {
  try {
    const promoResult = await pool.query(
      'SELECT * FROM promotions WHERE id=$1', [req.params.id]
    );
    if (!promoResult.rows.length)
      return res.status(404).json({ success: false, message: 'Promotion introuvable' });

    const { sent, failed } = await _blastPromotion(promoResult.rows[0]);
    res.json({
      success: true,
      message: `✅ Envoyé à ${sent} client(s). Échecs : ${failed}.`,
      sent,
      failed,
    });
  } catch (err) {
    console.error('promotionsController.sendBlast:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* ── internal helper shared by create + sendBlast ── */
const _blastPromotion = async (promotion) => {
  const clientsResult = await pool.query(
    'SELECT first_name, email FROM clients ORDER BY created_at DESC'
  );
  let sent = 0, failed = 0;
  for (const client of clientsResult.rows) {
    try {
      await sendPromotionEmail({ email: client.email, firstName: client.first_name, promotion });
      sent++;
    } catch (err) {
      console.error(`❌ Failed to send to ${client.email}:`, err.message);
      failed++;
    }
    await new Promise(r => setTimeout(r, 120)); // avoid Gmail rate limits
  }
  return { sent, failed };
};

module.exports = { getAll, getAccueil, getByCategorie, create, update, toggle, remove, sendBlast };
