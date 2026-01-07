const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    phone: {
        type: String,
        required: [true, 'Please provide a phone number'],
        match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },

    preferences: {
        preferredProducts: [{
            type: String,
            trim: true
        }],
        budgetRange: {
            min: {
                type: Number,
                min: [0, 'Budget cannot be negative']
            },
            max: {
                type: Number,
                min: [0, 'Budget cannot be negative']
            }
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            sms: {
                type: Boolean,
                default: false
            }
        }
    }
}, {
    timestamps: true
});

// Index for faster queries
customerSchema.index({ user: 1 }, { unique: true });
customerSchema.index({ phone: 1 }, { unique: true });



module.exports = mongoose.model('Customer', customerSchema);
