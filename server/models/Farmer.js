const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
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
    address: {
        street: {
            type: String,
            required: [true, 'Please provide street address']
        },
        city: {
            type: String,
            required: [true, 'Please provide city']
        },
        state: {
            type: String,
            required: [true, 'Please provide state']
        },
        pincode: {
            type: String,
            required: [true, 'Please provide pincode'],
            match: [/^[1-9][0-9]{5}$/, 'Please provide a valid 6-digit pincode']
        },
        country: {
            type: String,
            default: 'India'
        }
    },
    farmSize: {
        type: Number,
        required: [true, 'Please provide farm size in acres'],
        min: [0.1, 'Farm size must be at least 0.1 acres']
    },
    crops: [{
        type: String,
        trim: true
    }],
    livestock: [{
        type: String,
        trim: true
    }],
    aadharNumber: {
        type: String,
        required: [true, 'Please provide Aadhar number'],
        match: [/^\d{12}$/, 'Aadhar number must be exactly 12 digits']
    },
    bankDetails: {
        accountNumber: {
            type: String,
            required: [true, 'Please provide bank account number']
        },
        bankName: {
            type: String,
            required: [true, 'Please provide bank name']
        },
        ifscCode: {
            type: String,
            required: [true, 'Please provide IFSC code'],
            match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please provide a valid IFSC code']
        },
        accountHolderName: {
            type: String,
            required: [true, 'Please provide account holder name']
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    documents: [{
        documentType: {
            type: String,
            enum: ['aadhar', 'landRecord', 'bankPassbook', 'other'],
            required: true
        },
        documentUrl: {
            type: String,
            required: true
        },
        uploadDate: {
            type: Date,
            default: Date.now
        },
        isVerified: {
            type: Boolean,
            default: false
        }
    }]
}, {
    timestamps: true
});

// Index for faster queries
farmerSchema.index({ user: 1 }, { unique: true });
farmerSchema.index({ aadharNumber: 1 }, { unique: true });
farmerSchema.index({ 'bankDetails.accountNumber': 1 });

// Add text index for search functionality
farmerSchema.index({
    'address.city': 'text',
    'address.state': 'text',
    crops: 'text',
    livestock: 'text'
});

module.exports = mongoose.model('Farmer', farmerSchema);
