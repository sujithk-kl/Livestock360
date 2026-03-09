const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        productName: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Farmer'
        },
        farmerName: String,
        quantity: {
            type: Number,
            required: true
        },
        unit: String,
        price: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    isAddon: {
        type: Boolean,
        default: false
    },
    paymentStatus: {
        type: String,
        enum: ['Success', 'Pending', 'Failed', 'COD'],
        default: 'Pending'
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        default: 'QR Code'
    },

    // ── Cluster Delivery Fields ───────────────────────────────────────────────
    deliveryAddress: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        pincode: { type: String, trim: true }
    },
    deliveryDate: {
        type: Date
    },
    deliverySlot: {
        type: String,
        enum: ['Morning (6-9 AM)', 'Evening (5-7 PM)', 'With Milk Subscription'],
        default: null
    },
    deliveryFee: {
        type: Number,
        default: 0    // Finalised after clustering job runs at 10 PM
    },
    clusterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryCluster',
        default: null
    },
    deliveryStatus: {
        type: String,
        enum: ['Pending', 'Clustered', 'Out for Delivery', 'Delivered', 'Self-Pickup'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

