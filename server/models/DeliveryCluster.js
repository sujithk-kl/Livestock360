const mongoose = require('mongoose');

const deliveryClusterSchema = new mongoose.Schema({
    // Cluster key: group orders by pincode + slot + date
    pincode: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    deliveryDate: {
        type: Date,
        required: true
    },
    slot: {
        type: String,
        enum: ['Morning (6-9 AM)', 'Evening (5-7 PM)'],
        required: true
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    farmers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer'
    }],
    totalDeliveryFee: {
        type: Number,
        default: 100  // ₹100 per cluster, split among orders
    },
    perOrderFee: {
        type: Number,
        default: 0    // Calculated: totalDeliveryFee / orders.length
    },
    status: {
        type: String,
        enum: ['Forming', 'Confirmed', 'Out for Delivery', 'Delivered'],
        default: 'Forming'
    },
    deliveryPartner: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Compound index for fast lookups by area + date + slot
deliveryClusterSchema.index({ pincode: 1, deliveryDate: 1, slot: 1 }, { unique: true });

module.exports = mongoose.model('DeliveryCluster', deliveryClusterSchema);
