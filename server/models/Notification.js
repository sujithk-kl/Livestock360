const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: [
            'OOS',          // Out Of Stock
            'NEW_ORDER',    // Customer placed an order
            'SUB_NEW',      // New subscription created
            'SUB_SKIP',     // Customer skipped a single day
            'SUB_VACATION', // Customer paused a date range
            'SUB_RESUME',   // Customer resumed / cancelled vacation
            'SUB_CANCEL'    // Subscription cancelled
        ],
        default: 'OOS'
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
