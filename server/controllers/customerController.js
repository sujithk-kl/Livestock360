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
        const customer = await Customer.findOne({ email }).select('+password');

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await customer.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

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

// @desc    Forgot password - send reset email
// @route   POST /api/customers/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address'
            });
        }

        // Find customer by email
        const customer = await Customer.findOne({ email });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'No account found with that email address'
            });
        }

        // Generate reset token
        const resetToken = customer.createPasswordResetToken();
        await customer.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${process.env.CLIENT_URL}/customer-reset-password/${resetToken}`;

        // Email content
        const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">Password Reset Request</h2>
                <p>Hello ${customer.name},</p>
                <p>You requested to reset your password for your Livestock360 customer account.</p>
                <p>Please click the button below to reset your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="background-color: #3b82f6; color: white; padding: 12px 30px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #3498db;">${resetUrl}</p>
                <p><strong>This link will expire in 1 hour.</strong></p>
                <p>If you didn't request this, please ignore this email.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #7f8c8d; font-size: 12px;">
                    This is an automated message from Livestock360. Please do not reply to this email.
                </p>
            </div>
        `;

        try {
            await sendEmail({
                to: customer.email,
                subject: 'Password Reset Request - Livestock360',
                html: message
            });

            res.status(200).json({
                success: true,
                message: 'Password reset email sent successfully. Please check your inbox.'
            });
        } catch (error) {
            // If email sending fails, clear the reset token
            customer.resetPasswordToken = undefined;
            customer.resetPasswordExpires = undefined;
            await customer.save({ validateBeforeSave: false });

            console.error('Error sending email:', error);
            return res.status(500).json({
                success: false,
                message: 'Email could not be sent. Please try again later.'
            });
        }
    } catch (error) {
        console.error('Error in forgot password:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Reset password
// @route   PUT /api/customers/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const { token } = req.params;

        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a new password'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Hash the token from URL to match with stored hashed token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find customer with valid token and not expired
        const customer = await Customer.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+resetPasswordToken +resetPasswordExpires');

        if (!customer) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password
        customer.password = newPassword;
        customer.resetPasswordToken = undefined;
        customer.resetPasswordExpires = undefined;
        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.'
        });
    } catch (error) {
        console.error('Error in reset password:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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
