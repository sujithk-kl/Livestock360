const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// ── Create a new order (with optional cluster delivery) ────────────────────────
router.post('/', protect, async (req, res) => {
    try {
        const {
            items,
            totalAmount,
            paymentStatus,
            deliveryAddress,
            deliveryDate,
            deliverySlot
        } = req.body;

        const customer = await Customer.findById(req.user.id);
        if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

        const newOrder = new Order({
            customer: req.user.id,
            items,
            totalAmount,
            paymentStatus: paymentStatus || 'COD', // Accept 'Success' for online, default 'COD'
            paymentMethod: req.body.paymentMethod || 'Cash',

            deliveryAddress: deliveryAddress || null,
            deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
            deliverySlot: deliverySlot || null,
            deliveryStatus: deliverySlot === 'With Milk Subscription' ? 'Clustered' : 'Pending'
        });

        const savedOrder = await newOrder.save();

        // Update product stock and trigger OOS notifications
        for (const item of items) {
            const product = await Product.findByIdAndUpdate(
                item.product,
                { $inc: { quantity: -item.quantity } },
                { new: true }
            );
            if (product && product.quantity === 0) {
                await Notification.create({
                    recipient: product.farmer,
                    message: `Product "${product.productName}" is out of stock!`,
                    type: 'OOS',
                    product: product._id
                });
            }
        }

        res.status(201).json({ success: true, data: savedOrder });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ── Get orders for the logged-in customer (with cluster/delivery info) ─────────
router.get('/my-orders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user.id })
            .sort({ createdAt: -1 })
            .populate('clusterId', 'status slot deliveryDate pincode city perOrderFee deliveryPartner');
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;

