const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const { isLoggedIn } = require('../middlewares');

// My Bookings (Guest)
router.get('/my-bookings', isLoggedIn, async (req, res) => {
    const bookings = await Booking.find({ guest: req.user._id })
        .populate('listing')
        .populate('host', 'username')
        .sort({ createdAt: -1 });
    
    res.render('bookings/my-bookings', { bookings });
});

// Host Bookings
router.get('/host-bookings', isLoggedIn, async (req, res) => {
    const bookings = await Booking.find({ host: req.user._id })
        .populate('listing')
        .populate('guest', 'username email')
        .sort({ createdAt: -1 });
    
    res.render('bookings/host-bookings', { bookings });
});

// Confirm booking (Host)
router.post('/:id/confirm', isLoggedIn, async (req, res) => {
    const booking = await Booking.findOne({ _id: req.params.id, host: req.user._id });
    
    if (!booking) {
        req.flash('error', 'Booking not found');
        return res.redirect('/bookings/host-bookings');
    }
    
    booking.status = 'confirmed';
    await booking.save();
    
    req.flash('success', 'Booking confirmed!');
    res.redirect('/bookings/host-bookings');
});

module.exports = router;