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
        farmer: {
            type: mongoose.Schema.Types.ObjectId, // Can be null if generic/deleted, but usually linked
            ref: 'Farmer'
        },
        farmerName: String, // Store snapshot in case farmer is deleted
        quantity: {
            type: Number,
            required: true
        },
        unit: String,
        price: { // Rate
            type: Number,
            required: true
        },
        total: { // Amount for this item
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Success', 'Pending', 'Failed'],
        default: 'Pending'
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        default: 'QR Code'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
