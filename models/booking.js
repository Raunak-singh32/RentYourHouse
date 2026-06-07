const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    guest: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    razorpayOrderId: {
        type: String,
        required: true
    },
    razorpayPaymentId: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    checkInDate: {
        type: Date,
        default: null
    },
    checkOutDate: {
        type: Date,
        default: null
    },
    guests: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', bookingSchema);