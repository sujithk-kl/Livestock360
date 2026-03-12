const mongoose = require('mongoose');

const PushSubscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    userRole: {
        type: String,
        enum: ['farmer', 'customer'],
        required: true
    },
    subscription: {
        endpoint: { type: String, required: true },
        keys: {
            p256dh: { type: String, required: true },
            auth: { type: String, required: true }
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure one subscription object per endpoint
PushSubscriptionSchema.index({ 'subscription.endpoint': 1 }, { unique: true });

module.exports = mongoose.model('PushSubscription', PushSubscriptionSchema);
