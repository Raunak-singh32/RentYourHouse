const express = require('express');
const router = express.Router();
const payments = require('../controllers/payments');

router.post('/create-order', payments.createOrder);
router.post('/verify-payment', payments.verifyPayment);

module.exports = router;