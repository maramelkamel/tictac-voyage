// backend/services/hotelService.js
// Kept for backward-compatibility with Server.js startup hooks.

const hotelModel = require('../models/hotelModel');

const ensureHotelSchema = async () => hotelModel.ensureHotelSchema();
const seedHotelsIfEmpty = async () => hotelModel.seedHotelsIfEmpty();

module.exports = { ensureHotelSchema, seedHotelsIfEmpty };

