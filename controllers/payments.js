const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/booking');
const Listing = require('../models/listing');


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create order
module.exports.createOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;
        
        // ADD THESE DEBUG LINES
        console.log('=== DEBUG ===');
        console.log('Received body:', req.body);
        console.log('Amount:', amount);
        console.log('Amount type:', typeof amount);
        console.log('RAZORPAY_KEY_ID exists:', !!process.env.RAZORPAY_KEY_ID);
        console.log('RAZORPAY_KEY_SECRET exists:', !!process.env.RAZORPAY_KEY_SECRET);
        console.log('=== END DEBUG ===');
        
        const options = {
            amount: Number(amount) * 100,
            currency: currency,
          receipt: `rcpt_${Date.now()}`  // 14 chars = safe
        };

        const order = await razorpay.orders.create(options);
        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Razorpay Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Verify payment
module.exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, listingId, amount } = req.body;
        
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Find listing to get host
            const listing = await Listing.findById(listingId).populate('owner');
            
            if (!listing) {
                return res.status(404).json({ success: false, message: 'Listing not found' });
            }

            // Create booking
            const booking = new Booking({
                listing: listingId,
                guest: req.user._id,
                host: listing.owner._id,
                amount: amount / 100, // Convert paise to rupees
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                status: 'paid'
            });

            await booking.save();

            res.json({ 
                success: true, 
                message: 'Payment verified and booking saved!',
                bookingId: booking._id
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Verify Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
module.exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, listingId } = req.body;
        
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Find the listing to get host
            const listing = await Listing.findById(listingId).populate('owner');
            
            if (!listing) {
                return res.status(404).json({ success: false, message: 'Listing not found' });
            }

            // Create booking
            const booking = new Booking({
                listing: listingId,
                guest: req.user._id,  // Current logged in user
                host: listing.owner._id,
                amount: req.body.amount / 100, // Convert paise to rupees
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                status: 'paid'
            });

            await booking.save();

            res.json({ 
                success: true, 
                message: 'Payment verified and booking saved!',
                bookingId: booking._id
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Verify Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};