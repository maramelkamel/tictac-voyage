const express = require('express');
const jwt = require('jsonwebtoken');
const { requireAdmin } = require('../middleware/adminMiddleware');
const controller = require('../controllers/hotelController');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tictacvoyage_secret';

const requireClient = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token manquant' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.clientId = decoded.id;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalide ou expire' });
  }
};

router.get('/popular', controller.getPopularHotels);
router.get('/covers', controller.getHotelCovers);
router.put('/covers', requireAdmin, controller.updateHotelCovers);

router.get('/mine', requireClient, controller.getMyReservations);
router.post('/book', requireClient, controller.bookHotel);

router.get('/reservations', requireAdmin, controller.getReservations);
router.patch('/reservations/:id/status', requireAdmin, controller.updateReservationStatus);

router.get('/admin/hotels', requireAdmin, controller.getAdminHotels);
router.post('/admin/hotels', requireAdmin, controller.createHotel);
router.put('/admin/hotels/:id', requireAdmin, controller.updateHotel);
router.delete('/admin/hotels/:id', requireAdmin, controller.deleteHotel);

router.get('/', controller.getPublicHotels);
router.get('/:id', controller.getHotelById);

module.exports = router;
