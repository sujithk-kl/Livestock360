const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const customerSchema = new mongoose.Schema({
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
    failedAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,
    phone: {
        type: String,
        required: [true, 'Please provide a phone number'],
        match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    address: {
        city: {
            type: String,
            trim: true
        }
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
    },
    // Reset Password Token
    resetPasswordToken: String,
    resetPasswordExpire: Date

}, {
    timestamps: true
});

// Hash password before saving
customerSchema.pre('save', async function () {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to get reset password token
customerSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire time (e.g., 10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

// Method to compare password
customerSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
};

// Virtual for account lock status
customerSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Method to increment failed login attempts
customerSchema.methods.incLoginAttempts = function () {
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
customerSchema.methods.resetLoginAttempts = function () {
    return this.updateOne({
        $unset: { lockUntil: 1 },
        $set: { failedAttempts: 0 }
    }).exec();
};

// Index for faster queries
customerSchema.index({ phone: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);

