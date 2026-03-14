// backend/controllers/omraController.js
const omraModel = require('../models/omraModel');

/* GET /api/omra/packages — admin: all | public: active only */
const getAll = async (req, res) => {
  try {
    const publicOnly = req.query.public === 'true';
    const packages   = publicOnly
      ? await omraModel.getActivePackages()
      : await omraModel.getAllPackages();
    res.json({ success: true, data: packages });
  } catch (err) {
    console.error('omraController.getAll:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* GET /api/omra/packages/:id */
const getOne = async (req, res) => {
  try {
    const pkg = await omraModel.getPackageById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Forfait introuvable' });
    res.json({ success: true, data: pkg });
  } catch (err) {
    console.error('omraController.getOne:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* POST /api/omra/packages */
const create = async (req, res) => {
  try {
    const { title, price, duration } = req.body;
    if (!title || !price || !duration) {
      return res.status(400).json({ success: false, message: 'Titre, prix et durée sont obligatoires' });
    }
    const pkg = await omraModel.createPackage(req.body);
    res.status(201).json({ success: true, data: pkg, message: 'Forfait créé avec succès' });
  } catch (err) {
    console.error('omraController.create:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* PUT /api/omra/packages/:id */
const update = async (req, res) => {
  try {
    const { title, price, duration } = req.body;
    if (!title || !price || !duration) {
      return res.status(400).json({ success: false, message: 'Titre, prix et durée sont obligatoires' });
    }
    const pkg = await omraModel.updatePackage(req.params.id, req.body);
    if (!pkg) return res.status(404).json({ success: false, message: 'Forfait introuvable' });
    res.json({ success: true, data: pkg, message: 'Forfait mis à jour' });
  } catch (err) {
    console.error('omraController.update:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* DELETE /api/omra/packages/:id */
const remove = async (req, res) => {
  try {
    const deleted = await omraModel.deletePackage(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Forfait introuvable' });
    res.json({ success: true, message: 'Forfait supprimé' });
  } catch (err) {
    console.error('omraController.remove:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { getAll, getOne, create, update, remove };