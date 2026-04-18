// backend/controllers/voyageOrganiseController.js
const model = require('../models/voyageOrganiseModel');

/* GET /api/voyages-organises
   - public=true  : catalogue visible côté client
   - sans query   : vue plus large utilisée par l'admin */
const getAll = async (req, res) => {
  try {
    const publicOnly = req.query.public === 'true';
    const data = publicOnly
      ? await model.getActiveVoyages()
      : await model.getAllVoyages();
    res.json({ success: true, data });
  } catch (err) {
    console.error('voyageOrganiseController.getAll:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* GET /api/voyages-organises/:id
   Retourne le détail d'un voyage précis. */
const getOne = async (req, res) => {
  try {
    const voyage = await model.getVoyageById(req.params.id);
    if (!voyage) return res.status(404).json({ success: false, message: 'Voyage introuvable' });
    res.json({ success: true, data: voyage });
  } catch (err) {
    console.error('voyageOrganiseController.getOne:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* POST /api/voyages-organises
   Création d'un voyage par l'interface d'administration. */
const create = async (req, res) => {
  try {
    const { title, price, duration } = req.body;
    if (!title || !price || !duration)
      return res.status(400).json({ success: false, message: 'Titre, prix et durée sont obligatoires' });
    const voyage = await model.createVoyage(req.body);
    res.status(201).json({ success: true, data: voyage, message: 'Voyage créé avec succès' });
  } catch (err) {
    console.error('voyageOrganiseController.create:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* PUT /api/voyages-organises/:id
   Mise à jour complète d'un voyage existant. */
const update = async (req, res) => {
  try {
    const { title, price, duration } = req.body;
    if (!title || !price || !duration)
      return res.status(400).json({ success: false, message: 'Titre, prix et durée sont obligatoires' });
    const voyage = await model.updateVoyage(req.params.id, req.body);
    if (!voyage) return res.status(404).json({ success: false, message: 'Voyage introuvable' });
    res.json({ success: true, data: voyage, message: 'Voyage mis à jour' });
  } catch (err) {
    console.error('voyageOrganiseController.update:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* DELETE /api/voyages-organises/:id
   Suppression d'un voyage du catalogue. */
const remove = async (req, res) => {
  try {
    const deleted = await model.deleteVoyage(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Voyage introuvable' });
    res.json({ success: true, message: 'Voyage supprimé' });
  } catch (err) {
    console.error('voyageOrganiseController.remove:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { getAll, getOne, create, update, remove };
