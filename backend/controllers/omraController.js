// backend/controllers/omraController.js
const omraModel = require('../models/omraModel');

// The key used to store hero-cover
const KEY='omra-covers'

// Default hero content
const DEFAULT = {
  hero: {
    bg_image:     '',
    tag:          'Pelerinage et Spiritualite',
    title:        'Votre Voyage',
    title_accent: 'Spirituel Ideal',
    sub:          'Accomplissez votre Omra en toute serenite avec nos forfaits tout compris, concus pour une experience spirituelle inoubliable. ',
  },};


   //Returns the hero section appearance settings for the public Omra page
  const getOmraCovers = async (req, res) => {
    try {
      // loads teh existing cover from db
      const data = await omraModel.getSetting(KEY);
      // Send either the stored data or the hardcoded defaults.
      res.json({ success: true, data: data ?? DEFAULT });
    } catch (err) {
      console.error('[settings] getOmraCovers:', err.message);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };
  

  // Called by the admin
  const updateOmraCovers = async (req, res) => {
    try {
      const { hero, nord, sud } = req.body;
     
      const saved = await omraModel.setSetting(KEY, { hero: hero || DEFAULT.hero });
      res.json({ success: true, data: saved, message: 'Apparence mise à jour' });
    } catch (err) {
      console.error('[settings] updateOmraCovers:', err.message);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };
  


/* GET /api/omra/packages — admin: all | public: active only */
const getAll = async (req, res) => {
  try {
    // Disable HTTP caching so the admin always sees the latest data.
    res.set('Cache-Control', 'no-store');
     // Determine which model method to call based on the query string.
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
// Used by the Details page when navigating directly to a URL
const getOne = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
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
    res.status(500).json({
  success: false,
  message: err.message,
  detail: err.detail
});
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

module.exports = { getAll, getOne, create, update, remove , getOmraCovers,updateOmraCovers};


