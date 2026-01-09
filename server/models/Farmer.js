const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
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
    farmName: {
        type: String,
        required: [true, 'Please provide farm name'],
        trim: true
    },
    farmAddress: {
        type: String,
        required: [true, 'Please provide farm address'],
        trim: true
    },
    farmType: {
        type: String,
        enum: ['Dairy', 'Livestock', 'Both', 'Other'],
        default: 'Dairy'
    },
    yearsOfFarming: {
        type: Number,
        required: [true, 'Please provide years of farming experience'],
        min: [0, 'Years of farming cannot be negative']
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
    }
}, {
    timestamps: true
});

// Index for faster queries
farmerSchema.index({ user: 1 }, { unique: true });
farmerSchema.index({ aadharNumber: 1 }, { unique: true });

// Add text index for search functionality
farmerSchema.index({
    'address.city': 'text',
    'address.state': 'text',
    crops: 'text',
    livestock: 'text'
});

module.exports = mongoose.model('Farmer', farmerSchema);
