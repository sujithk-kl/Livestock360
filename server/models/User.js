// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    roles: [{
        type: String,
        enum: ['user', 'farmer', 'customer', 'admin'],
        default: ['user']
    }],
    // Farmer specific fields
    phone: {
        type: String,
        match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: {
            type: String,
            match: [/^[1-9][0-9]{5}$/, 'Please provide a valid 6-digit pincode']
        },
        country: {
            type: String,
            default: 'India'
        }
    },
    farmSize: Number,
    farmName: String,
    farmAddress: String,
    farmType: {
        type: String,
        enum: ['Dairy', 'Livestock', 'Both', 'Other']
    },
    yearsOfFarming: Number,
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
        match: [/^\d{12}$/, 'Aadhar number must be exactly 12 digits']
    },
    bankDetails: {
        bankName: String,
        accountNumber: String,
        ifscCode: {
            type: String,
            uppercase: true,
            match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please provide a valid IFSC code']
        },
        accountHolderName: String
    },
    // Customer specific fields
    preferences: {
        preferredProducts: [{
            type: String,
            trim: true
        }],
        budgetRange: {
            min: Number,
            max: Number
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
    },
    failedAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
};

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Method to increment failed login attempts
userSchema.methods.incLoginAttempts = function() {
    // if we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { failedAttempts: 1 }
        }).exec();
    }
    const updates = { $inc: { failedAttempts: 1 } };
    // lock account after 5 failed attempts for 2 hours
    if (this.failedAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = {
            lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
        };
    }
    return this.updateOne(updates).exec();
};

// Method to reset failed login attempts
userSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: { failedAttempts: 1, lockUntil: 1 }
    }).exec();
};

// Indexes for faster queries
userSchema.index({ aadharNumber: 1 }, { sparse: true, unique: true });
userSchema.index({ phone: 1 }, { sparse: true, unique: true });

// Add text index for search functionality
userSchema.index({
    'address.city': 'text',
    'address.state': 'text',
    crops: 'text',
    livestock: 'text'
});

module.exports = mongoose.model('User', userSchema);
