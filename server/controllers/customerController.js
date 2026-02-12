const Customer = require('../models/Customer');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Login customer
const loginCustomer = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { email, password } = req.body;

        // Check customer
        const customer = await Customer.findOne({ email }).select('+password +failedAttempts +lockUntil');

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is locked
        if (customer.isLocked) {
            return res.status(401).json({
                success: false,
                message: 'Account locked due to too many failed attempts'
            });
        }

        // Check password
        const isMatch = await customer.comparePassword(password);
        if (!isMatch) {
            await customer.incLoginAttempts();
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Reset failed attempts on successful login
        await customer.resetLoginAttempts();

        // Generate token
        const token = generateToken(customer._id);

        res.json({
            success: true,
            data: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                roles: ['customer'],
                phone: customer.phone,
                preferences: customer.preferences,
                address: customer.address,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


const registerCustomer = async (req, res) => {
    console.log('Customer registration request body:', JSON.stringify(req.body, null, 2));

    // Input validation using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const {
            name,
            email,
            password,
            phone,
            preferences,
            city
        } = req.body;

        // Check if customer already exists
        let customer = await Customer.findOne({ email });
        if (customer) {
            return res.status(400).json({
                success: false,
                message: 'Customer already exists with this email'
            });
        }

        // Check if phone number is already registered
        const existingPhone = await Customer.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number already registered'
            });
        }

        // Create customer
        const newCustomer = new Customer({
            name,
            email,
            password,
            phone,
            preferences: {
                preferredProducts: preferences?.preferredProducts || [],
                budgetRange: preferences?.budgetRange || {},
                notifications: preferences?.notifications || { email: true, sms: false }
            },
            address: {
                city: city
            }
        });

        await newCustomer.save();
        console.log('Customer created successfully:', newCustomer.email);

        // Generate token for auto-login
        const token = generateToken(newCustomer._id);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: newCustomer._id,
                    name: newCustomer.name,
                    email: newCustomer.email,
                    roles: ['customer'],
                    phone: newCustomer.phone,
                    preferences: newCustomer.preferences,
                    address: newCustomer.address,
                    token
                }
            }
        });

    } catch (error) {
        console.error('Error registering customer:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get current customer's profile
// @route   GET /api/customers/me
// @access  Private (Customer only)
const getMyProfile = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer profile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: customer._id,
                    name: customer.name,
                    email: customer.email,
                    roles: ['customer'],
                    phone: customer.phone,
                    preferences: customer.preferences,
                    address: customer.address
                }
            }
        });
    } catch (error) {
        console.error('Error fetching customer profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Update customer profile
// @route   PUT /api/customers/me
// @access  Private (Customer only)
const updateProfile = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer profile not found'
            });
        }

        const updates = { ...req.body };

        // Remove fields that shouldn't be updated
        delete updates._id;
        delete updates.email; // Email should not be changed
        delete updates.password; // Password should be updated via separate endpoint
        delete updates.phone; // Phone number should not be changed (for verification purposes)

        // Update customer
        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: updatedCustomer._id,
                    name: updatedCustomer.name,
                    email: updatedCustomer.email,
                    roles: ['customer'],
                    phone: updatedCustomer.phone,
                    preferences: updatedCustomer.preferences,
                    address: updatedCustomer.address
                }
            }
        });
    } catch (error) {
        console.error('Error updating customer profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Change customer password
// @route   PUT /api/customers/password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both current and new passwords'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        const customer = await Customer.findById(req.user.id).select('+password');

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Check if current password matches
        const isMatch = await customer.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect current password'
            });
        }

        // Update password (pre-save hook will hash it)
        customer.password = newPassword;
        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


// @desc    Forgot Password
// @route   POST /api/customers/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const customer = await Customer.findOne({ email });

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Email not found' });
        }

        // Get reset token
        const resetToken = customer.getResetPasswordToken();

        await customer.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}?role=customer`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: customer.email,
                subject: 'Password Reset Token',
                message
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (error) {
            console.error(error);
            customer.resetPasswordToken = undefined;
            customer.resetPasswordExpire = undefined;

            await customer.save({ validateBeforeSave: false });

            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Reset Password
// @route   PUT /api/customers/resetpassword/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    try {
        const customer = await Customer.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!customer) {
            return res.status(400).json({ success: false, message: 'Invalid token' });
        }

        // Set new password
        customer.password = req.body.password;
        customer.resetPasswordToken = undefined;
        customer.resetPasswordExpire = undefined;

        await customer.save();

        // Log user in directly
        const token = generateToken(customer._id);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: customer._id,
                    name: customer.name,
                    email: customer.email,
                    roles: ['customer'],
                    phone: customer.phone,
                    preferences: customer.preferences,
                    address: customer.address,
                    token
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


module.exports = {
    loginCustomer,
    registerCustomer,
    getMyProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword
};
