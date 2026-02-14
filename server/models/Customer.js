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
    resetPasswordToken: {
        type: String,
        select: false
    },
    resetPasswordExpires: {
        type: Date,
        select: false
    }
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



// Method to compare password
customerSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
};

// Method to create password reset token
customerSchema.methods.createPasswordResetToken = function () {
    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set token expiration to 1 hour from now
    this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    // Return unhashed token to send via email
    return resetToken;
};


// Index for faster queries
customerSchema.index({ phone: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);

