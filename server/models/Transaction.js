const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    type: {
        type: String,
        enum: ['CREDIT', 'DEBIT'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    relatedSubscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription' // Optional
    },
    balanceAfter: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
