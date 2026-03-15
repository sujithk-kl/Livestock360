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
            deliverySlot,
            deliveryMethod
        } = req.body;

        const customer = await Customer.findById(req.user.id);
        if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

        const isExpress = deliveryMethod === 'Express';
        const newOrder = new Order({
            customer: req.user.id,
            items,
            totalAmount,
            paymentStatus: paymentStatus || 'COD',
            paymentMethod: req.body.paymentMethod || 'Cash',
            deliveryAddress: deliveryAddress || null,
            deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
            deliverySlot: deliverySlot || null,
            deliveryMethod: deliveryMethod || 'Standard',
            deliveryStatus: isExpress ? 'Out for Delivery'
                : deliverySlot === 'With Milk Subscription' ? 'Clustered'
                : 'Pending'
        });

        const savedOrder = await newOrder.save();

        // Update product stock + OOS notifications
        const farmerNotified = new Set();
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
            // Fire NEW_ORDER notification once per farmer (group items)
            if (product && !farmerNotified.has(product.farmer.toString())) {
                farmerNotified.add(product.farmer.toString());
                const custName = customer.name || 'A customer';
                Notification.create({
                    recipient: product.farmer,
                    message: `📦 New order from ${custName}: ${item.productName} ×${item.quantity}${item.unit || ''} — ₹${item.total}`,
                    type: 'NEW_ORDER',
                    order: savedOrder._id
                }).catch(e => console.error('[Order Notify Error]', e.message));
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

