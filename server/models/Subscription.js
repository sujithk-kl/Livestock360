const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    quantityPerDay: {
        type: Number,
        required: true,
        min: 0.1
    },
    unit: {
        type: String,
        required: true
    },
    timing: {
        type: String,
        enum: ['Morning', 'Evening', 'Both'],
        default: 'Morning'
    },
    productCostPerDay: {
        type: Number,
        required: true
    },
    deliveryCostPerDay: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Paused', 'Cancelled', 'Completed'],
        default: 'Active'
    },
    pausedDates: {
        type: [Date], // Array of specifically paused or skipped dates
        default: []
    },
    totalBilledAmount: {
        type: Number,
        default: 0
    },
    refundAmount: {
        type: Number,
        default: 0
    },
    cancelledAt: {
        type: Date
    },
    deliveryAddress: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        pincode: { type: String, default: '' },
    },
    addOns: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            productName: { type: String, required: true },
            quantity: { type: Number, required: true, min: 0.1 },
            unit: { type: String, required: true },
            costPerDelivery: { type: Number, required: true },
            type: {
                type: String,
                enum: ['one-time', 'recurring'],
                required: true
            },
            // For one-time: a single date. For recurring: matched via recurringDays.
            deliveryDate: { type: Date },
            // e.g. ['Monday', 'Thursday'] or ['1', '15'] (day-of-month numbers as strings)
            recurringDays: { type: [String], default: [] },
            status: {
                type: String,
                enum: ['Active', 'Completed', 'Removed'],
                default: 'Active'
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
