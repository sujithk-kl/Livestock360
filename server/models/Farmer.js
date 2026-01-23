const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const farmerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true
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
        required: [true, 'Please provide a phone number']
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
            required: [true, 'Please provide pincode']
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
        required: [true, 'Please provide Aadhar number']
    },
    bankDetails: {
        bankName: {
            type: String,
            required: [true, 'Please provide bank name'],
            trim: true
        },
        accountNumber: {
            type: String,
            required: [true, 'Please provide account number'],
            trim: true
        },
        ifscCode: {
            type: String,
            required: [true, 'Please provide IFSC code'],
            trim: true
        },
        accountHolderName: {
            type: String,
            required: [true, 'Please provide account holder name'],
            trim: true
        }
    }
}, {
    timestamps: true
});

// Hash password before saving
farmerSchema.pre('save', async function () {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
farmerSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
};

// Virtual for account lock status
farmerSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Encryption configuration
const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_SECRET || 'your_32_byte_hex_secret_key_livestock360_secure';
// Ensure key is 32 bytes
const key = crypto.scryptSync(secretKey, 'salt', 32);

// Encrypt text
function encrypt(text) {
    if (!text) return text;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Decrypt text
function decrypt(text) {
    if (!text) return text;
    // Check if text is in "iv:encrypted" format
    const textParts = text.split(':');
    if (textParts.length !== 2) return text; // Assume not encrypted or invalid format

    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

// Pre-save hook to encrypt bank details
farmerSchema.pre('save', async function () {
    if (this.isModified('bankDetails')) {
        if (this.bankDetails.accountNumber && !this.bankDetails.accountNumber.includes(':')) {
            this.bankDetails.accountNumber = encrypt(this.bankDetails.accountNumber);
        }
        if (this.bankDetails.ifscCode && !this.bankDetails.ifscCode.includes(':')) {
            this.bankDetails.ifscCode = encrypt(this.bankDetails.ifscCode);
        }
        // Encrypt other fields if needed, usually Account No and IFSC are critical
    }
});

// Method to get decrypted bank details
farmerSchema.methods.getDecryptedBankDetails = function () {
    const details = this.bankDetails ? this.bankDetails.toObject() : {};

    if (details.accountNumber) {
        details.accountNumber = decrypt(details.accountNumber);
    }
    if (details.ifscCode) {
        details.ifscCode = decrypt(details.ifscCode);
    }

    return details;
};

// Method to increment failed login attempts
farmerSchema.methods.incLoginAttempts = function () {
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
            lockUntil: Date.now() + 2 * 60 * 60 * 1000
        };
    }
    return this.updateOne(updates).exec();
};

// Method to reset failed login attempts
farmerSchema.methods.resetLoginAttempts = function () {
    return this.updateOne({
        $unset: { lockUntil: 1 },
        $set: { failedAttempts: 0 }
    }).exec();
};

// Index for faster queries
farmerSchema.index({ aadharNumber: 1 }, { unique: true });

module.exports = mongoose.model('Farmer', farmerSchema);
