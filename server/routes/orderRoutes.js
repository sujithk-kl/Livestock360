const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// Create a new order
router.post('/', protect, async (req, res) => {
    try {
        const { items, totalAmount, paymentStatus } = req.body;

        const newOrder = new Order({
            customer: req.user.id, // From auth middleware
            items,
            totalAmount,
            paymentStatus: paymentStatus || 'Success' // defaulting to Success for this flow as it's post-payment
        });

        const savedOrder = await newOrder.save();
        res.status(201).json({ success: true, data: savedOrder });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// Get orders for the logged-in customer
router.get('/my-orders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
