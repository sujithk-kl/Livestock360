const express = require('express');
const router = express.Router();
const DeliveryCluster = require('../models/DeliveryCluster');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

/**
 * GET /api/clusters/today
 * Farmer: get today's confirmed delivery clusters involving their products
 */
router.get('/today', protect, authorize('admin', 'farmer'), async (req, res) => {
    try {
        const farmerId = req.user.id;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const clusters = await DeliveryCluster.find({
            farmers: farmerId,
            status: { $in: ['Confirmed', 'Out for Delivery'] }
        }).populate({
            path: 'orders',
            populate: [
                { path: 'customer', select: 'name phone' },
                { path: 'items.farmer', select: 'name' }
            ]
        });

        res.json({ success: true, data: clusters });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * GET /api/clusters/upcoming
 * Farmer: see clusters for the next 3 days
 */
router.get('/upcoming', protect, authorize('admin', 'farmer'), async (req, res) => {
    try {
        const farmerId = req.user.id;
        const now = new Date();
        const plus3 = new Date();
        plus3.setDate(now.getDate() + 3);

        const clusters = await DeliveryCluster.find({
            farmers: farmerId,
            deliveryDate: { $gte: now, $lte: plus3 },
            status: { $ne: 'Delivered' }
        }).populate({
            path: 'orders',
            populate: { path: 'customer', select: 'name phone' }
        }).sort({ deliveryDate: 1, slot: 1 });

        res.json({ success: true, data: clusters });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * PUT /api/clusters/:id/status
 * Farmer: update cluster status (Out for Delivery / Delivered)
 */
router.put('/:id/status', protect, authorize('admin', 'farmer'), async (req, res) => {
    try {
        const { status, deliveryPartner } = req.body;
        const validStatuses = ['Confirmed', 'Out for Delivery', 'Delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const cluster = await DeliveryCluster.findByIdAndUpdate(
            req.params.id,
            { status, ...(deliveryPartner && { deliveryPartner }) },
            { new: true }
        );

        if (!cluster) return res.status(404).json({ success: false, message: 'Cluster not found' });

        // If marking as Delivered, update all orders in cluster
        if (status === 'Delivered') {
            await Order.updateMany(
                { clusterId: cluster._id },
                { deliveryStatus: 'Delivered' }
            );
        }
        if (status === 'Out for Delivery') {
            await Order.updateMany(
                { clusterId: cluster._id },
                { deliveryStatus: 'Out for Delivery' }
            );
        }

        res.json({ success: true, data: cluster });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * GET /api/clusters/my-order/:orderId
 * Customer: get cluster info for their order
 */
router.get('/my-order/:orderId', protect, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.orderId, customer: req.user.id });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (!order.clusterId) return res.json({ success: true, data: null });

        const cluster = await DeliveryCluster.findById(order.clusterId).select(
            'status slot deliveryDate pincode city perOrderFee totalDeliveryFee deliveryPartner'
        );

        res.json({ success: true, data: cluster });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
