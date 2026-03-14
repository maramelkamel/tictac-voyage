// backend/controllers/clientController.js
const clientModel = require('../models/clientModel');

/* POST /api/clients/register */
const register = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password } = req.body;

    if (!first_name || !last_name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Mot de passe trop court (8 caractères minimum)' });
    }

    // Check email not already used
    const existing = await clientModel.getClientByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Un compte avec cet email existe déjà' });
    }

    const client = await clientModel.createClient(req.body);
    res.status(201).json({ success: true, data: client, message: 'Compte créé avec succès' });
  } catch (err) {
    console.error('clientController.register:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* POST /api/clients/login */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
    }

    const client = await clientModel.getClientByEmail(email);
    if (!client) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    const valid = await clientModel.verifyPassword(password, client.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    // Return client data without password_hash
    const { password_hash, ...clientData } = client;
    res.json({ success: true, data: clientData, message: 'Connexion réussie' });
  } catch (err) {
    console.error('clientController.login:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* GET /api/clients — admin */
const getAll = async (req, res) => {
  try {
    const { search } = req.query;
    const clients = await clientModel.getAllClients({ search });
    res.json({ success: true, data: clients });
  } catch (err) {
    console.error('clientController.getAll:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* GET /api/clients/:id — admin */
const getOne = async (req, res) => {
  try {
    const client = await clientModel.getClientById(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: 'Client introuvable' });
    res.json({ success: true, data: client });
  } catch (err) {
    console.error('clientController.getOne:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { register, login, getAll, getOne };