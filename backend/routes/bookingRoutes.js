const express = require('express');
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getMyBookings,
  approveBooking,
  rejectBooking,
  issueAsset,
  returnAsset
} = require('../controllers/bookingController');
const {protect, adminOnly} = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);

router.get('/my', protect, getMyBookings);

router.get('/', protect, adminOnly, getAllBookings);

router.put('/:id/approve', protect, adminOnly, approveBooking);

router.put('/:id/reject', protect, adminOnly, rejectBooking);

router.put('/:id/issue', protect, adminOnly, issueAsset);

router.put('/:id/return', protect, adminOnly, returnAsset);

module.exports = router;