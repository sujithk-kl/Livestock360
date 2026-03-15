const cron = require('node-cron');
const Order = require('../models/Order');
const DeliveryCluster = require('../models/DeliveryCluster');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

/**
 * CLUSTERING JOB
 * Runs every night at 10:00 PM IST.
 * Groups pending orders by pincode + deliverySlot + deliveryDate.
 * Creates or updates DeliveryCluster records.
 * Splits delivery cost equally and deducts from each customer's wallet.
 */
const TOTAL_CLUSTER_FEE = 100;  // ₹100 flat per cluster route
const MIN_FEE_PER_ORDER = 15;  // Minimum each customer pays even in large cluster
const MAX_FEE_PER_ORDER = 80;  // Maximum single customer pays

const runClusteringJob = async () => {
    console.log('[ClusterJob] Starting nightly clustering at', new Date().toISOString());

    try {
        // 1. Find all orders that need clustering (placed today, delivery date tomorrow or future, not yet clustered)
        const tomorrow = new Date();
        tomorrow.setHours(0, 0, 0, 0); // Start of today (effectively pulls anything upcoming)

        const pendingOrders = await Order.find({
            deliveryStatus: 'Pending',
            deliveryDate: { $gte: tomorrow },
            deliverySlot: { $in: ['Morning (6-9 AM)', 'Evening (5-7 PM)'] },
            'deliveryAddress.pincode': { $exists: true, $ne: '' },
            deliveryMethod: { $ne: 'Express' } // Express orders bypass clustering
        }).populate('customer', 'name phone walletBalance')
            .populate('items.farmer', 'name');

        if (pendingOrders.length === 0) {
            console.log('[ClusterJob] No pending orders to cluster.');
            return;
        }

        // 2. Group by { pincode + slot + deliveryDate (day) }
        const groups = {};
        for (const order of pendingOrders) {
            const pincode = order.deliveryAddress?.pincode || 'UNKNOWN';
            const slot = order.deliverySlot;
            const dateKey = new Date(order.deliveryDate).toISOString().split('T')[0];
            const key = `${pincode}__${slot}__${dateKey}`;

            if (!groups[key]) groups[key] = { pincode, slot, dateKey, orders: [] };
            groups[key].orders.push(order);
        }

        // 3. For each group, create/update a DeliveryCluster and assign fixed delivery fees
        for (const key of Object.keys(groups)) {
            const { pincode, slot, dateKey, orders } = groups[key];

            // Fixed delivery fees per type (mirrors frontend DELIVERY_OPTIONS)
            const FIXED_FEES = { 'Express': 29, 'Standard': 19, 'Eco Saver': 14 };
            const representativeFee = 19; // Standard fee for cluster record

            // Collect unique farmers involved
            const farmerIdSet = new Set();
            for (const order of orders) {
                for (const item of (order.items || [])) {
                    if (item && item.farmer && item.farmer._id) {
                        farmerIdSet.add(item.farmer._id.toString());
                    } else if (item && item.farmer) {
                        farmerIdSet.add(item.farmer.toString());
                    }
                }
            }
            const farmerIds = [...farmerIdSet];

            // Upsert the DeliveryCluster document
            const deliveryDate = new Date(dateKey);
            const cluster = await DeliveryCluster.findOneAndUpdate(
                { pincode, slot, deliveryDate },
                {
                    $set: {
                        city: orders[0].deliveryAddress?.city || '',
                        totalDeliveryFee: TOTAL_CLUSTER_FEE,
                        perOrderFee: stdFee,
                        farmers: farmerIds,
                        status: 'Confirmed'
                    },
                    $addToSet: { orders: { $each: orders.map(o => o._id) } }
                },
                { upsert: true, new: true }
            );

            // 4. Update each order with its fixed delivery fee
            for (const order of orders) {
                const fee = FIXED_FEES[order.deliveryMethod] || 19;
                await Order.findByIdAndUpdate(order._id, {
                    deliveryFee: fee,
                    clusterId: cluster._id,
                    deliveryStatus: 'Clustered'
                });
            }

            console.log(`[ClusterJob] Cluster ${key}: ${orders.length} orders mapped to fixed fees`);
        }

        console.log('[ClusterJob] Finished. Clusters formed:', Object.keys(groups).length);

    } catch (err) {
        console.error('[ClusterJob] Error:', err);
    }
};

const initClusteringJob = () => {
    // Run at 10:00 PM IST (16:30 UTC) every night
    cron.schedule('30 16 * * *', runClusteringJob, {
        timezone: 'Asia/Kolkata'
    });
    console.log('[Cron] Cluster delivery grouping job scheduled for 10:00 PM IST every night.');
};

module.exports = { initClusteringJob, runClusteringJob };
