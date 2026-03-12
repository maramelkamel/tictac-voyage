// backend/routes/chatRoutes.js
const express   = require('express');
const router    = express.Router();
const rateLimit = require('express-rate-limit');
const { chat, getSuggestions } = require('../controllers/chatController');

// Protection : max 40 messages par IP par heure
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    reply: "Vous avez envoyé trop de messages. Réessayez dans une heure ou appelez-nous au +216 36 149 885.",
  },
});

router.post('/',           chatLimiter, chat);
router.get('/suggestions', getSuggestions);

module.exports = router;