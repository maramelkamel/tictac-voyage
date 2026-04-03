// backend/controllers/clientController.js
const clientModel = require('../models/clientModel');
const pool        = require('../config/db');

/* ── POST /api/clients/register ── */
const register = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password } = req.body;
    if (!first_name || !last_name || !email || !phone || !password)
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    if (password.length < 8)
      return res.status(400).json({ success: false, message: 'Mot de passe trop court (8 caractères minimum)' });

    const existing = await clientModel.getClientByEmail(email);
    if (existing)
      return res.status(409).json({ success: false, message: 'Un compte avec cet email existe déjà' });

    const client = await clientModel.createClient(req.body);
    res.status(201).json({ success: true, data: client, message: 'Compte créé avec succès' });
  } catch (err) {
    console.error('clientController.register:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* ── POST /api/clients/login ── */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });

    const client = await clientModel.getClientByEmail(email);
    if (!client)
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });

    const valid = await clientModel.verifyPassword(password, client.password_hash);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });

    const { password_hash, ...clientData } = client;
    res.json({ success: true, data: clientData, message: 'Connexion réussie' });
  } catch (err) {
    console.error('clientController.login:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* ── GET /api/clients ── */
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

/* ── GET /api/clients/:id ── */
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

/* ── PUT /api/clients/:id ── */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, city, marital_status, number_of_children } = req.body;

    const { rows } = await pool.query(
      `UPDATE public.clients
       SET first_name          = $1,
           last_name           = $2,
           phone               = $3,
           city                = $4,
           marital_status      = $5,
           number_of_children  = $6,
           updated_at          = NOW()
       WHERE id = $7
       RETURNING id, first_name, last_name, email, phone, city, marital_status, number_of_children, created_at, updated_at`,
      [first_name, last_name, phone, city || null, marital_status || null, number_of_children ?? 0, id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Client introuvable' });
    res.json({ success: true, data: rows[0], message: 'Profil mis à jour' });
  } catch (err) {
    console.error('clientController.update:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* ── DELETE /api/clients/:id ── */
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'DELETE FROM public.clients WHERE id = $1 RETURNING id',
      [id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Client introuvable' });
    res.json({ success: true, message: 'Client supprimé avec succès' });
  } catch (err) {
    console.error('clientController.deleteClient:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { register, login, getAll, getOne, update, deleteClient };