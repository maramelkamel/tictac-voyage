// backend/controllers/circuitController.js

const model = require('../models/circuitModel');

const KEY = 'circuit-covers';

const DEFAULT = {
  hero: {
    bg_image:     '',
    tag:          'Circuits touristiques - Tunisie',
    title:        'Explorez la Tunisie',
    title_accent: 'du Nord au Sud',
    sub:          'Des circuits soigneusement conçus pour vous faire découvrir les trésors du pays, entre mer, désert, culture et authenticité.',
  },
  nord: {
    image_url:        '',
    card_title:       'Circuit Nord',
    card_description: 'Patrimoine, côtes sauvages, sites romains et forêts de pins du Tell.',
    hero_title:       'Découvrez le Nord de la Tunisie',
    hero_sub:         'Médinas historiques, côtes coralliennes, vestiges romains et montagnes verdoyantes.',
    icon:             '🏛',
  },
  sud: {
    image_url:        '',
    card_title:       'Circuit Sud',
    card_description: 'Désert doré, ksour berbères, oasis de palmiers et nuits sous les étoiles.',
    hero_title:       'Aventures dans le Grand Sud',
    hero_sub:         'Sahara infini, villages berbères millénaires, oasis enchanteresses et ciels étoilés.',
    icon:             '🏜',
  },
};

const getCircuitCovers = async (req, res) => {
  try {
    const data = await model.getSetting(KEY);
    res.json({ success: true, data: data ?? DEFAULT });
  } catch (err) {
    console.error('[settings] getCircuitCovers:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const updateCircuitCovers = async (req, res) => {
  try {
    const { hero, nord, sud } = req.body;
    if (!nord || !sud) {
      return res.status(400).json({ success: false, message: 'Les données nord et sud sont obligatoires' });
    }
    const saved = await model.setSetting(KEY, { hero: hero || DEFAULT.hero, nord, sud });
    res.json({ success: true, data: saved, message: 'Apparence mise à jour' });
  } catch (err) {
    console.error('[settings] updateCircuitCovers:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const getAll = async (req, res) => {
  try {
    const data = req.query.public === 'true' ? await model.getActiveCircuits() : await model.getAllCircuits();
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

const getOne = async (req, res) => {
  try {
    const c = await model.getCircuitById(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Circuit introuvable' });
    res.json({ success: true, data: c });
  } catch (err) { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

const create = async (req, res) => {
  try {
    const { title, price, duration } = req.body;
    if (!title || !price || !duration) return res.status(400).json({ success: false, message: 'Titre, prix et durée obligatoires' });
    const c = await model.createCircuit(req.body);
    res.status(201).json({ success: true, data: c, message: 'Circuit créé' });
  } catch (err) { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

const update = async (req, res) => {
  try {
    const { title, price, duration } = req.body;
    if (!title || !price || !duration) return res.status(400).json({ success: false, message: 'Titre, prix et durée obligatoires' });
    const c = await model.updateCircuit(req.params.id, req.body);
    if (!c) return res.status(404).json({ success: false, message: 'Circuit introuvable' });
    res.json({ success: true, data: c, message: 'Circuit mis à jour' });
  } catch (err) { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

const remove = async (req, res) => {
  try {
    const deleted = await model.deleteCircuit(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Circuit introuvable' });
    res.json({ success: true, message: 'Circuit supprimé' });
  } catch (err) { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

module.exports = { getAll, getOne, create, update, remove, getCircuitCovers, updateCircuitCovers };