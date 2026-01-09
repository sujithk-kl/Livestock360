const Customer = require('../models/Customer');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
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
            preferences
        } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (!user) {
            // Create user account
            user = new User({
                name,
                email,
                password,
                roles: ['user']
            });
            await user.save();
            console.log('User created successfully:', user.email);
        }

        // Check if user already has a customer profile
        const existingCustomer = await Customer.findOne({ user: user._id });
        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                message: 'Customer profile already exists for this user'
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

        // Create new customer profile
        const customer = new Customer({
            user: user._id,
            phone,
            preferences: {
                preferredProducts: preferences?.preferredProducts || [],
                budgetRange: preferences?.budgetRange || {},
                notifications: preferences?.notifications || { email: true, sms: false }
            }
        });

        await customer.save();

        // Update user role to 'customer' if not already
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $addToSet: { roles: 'customer' } },
            { new: true, runValidators: true }
        );

        // Generate token for auto-login
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                customer,
                user: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    roles: updatedUser.roles,
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
        const customer = await Customer.findOne({ user: req.user.id })
            .populate('user', 'name email');

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer profile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: customer
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
        const updates = { ...req.body };

        // Remove fields that shouldn't be updated directly
        delete updates._id;
        delete updates.user;
        delete updates.email; // Email should not be changed
        delete updates.phone; // Phone number should not be changed (for verification purposes)

        const customer = await Customer.findOneAndUpdate(
            { user: req.user.id },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer profile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: customer
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

module.exports = {
    registerCustomer,
    getMyProfile,
    updateProfile
};
