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
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Check if phone number is already registered
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number already registered'
            });
        }

        // Create new customer user with all data in User collection
        const newUser = new User({
            name,
            email,
            password,
            roles: ['user', 'customer'],
            phone,
            preferences: {
                preferredProducts: preferences?.preferredProducts || [],
                budgetRange: preferences?.budgetRange || {},
                notifications: preferences?.notifications || { email: true, sms: false }
            }
        });

        await newUser.save();
        console.log('Customer user created successfully:', newUser.email);

        // Generate token for auto-login
        const token = generateToken(newUser._id);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    roles: newUser.roles,
                    phone: newUser.phone,
                    preferences: newUser.preferences,
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
        const user = await User.findById(req.user.id);

        if (!user || !user.roles.includes('customer')) {
            return res.status(404).json({
                success: false,
                message: 'Customer profile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    roles: user.roles,
                    phone: user.phone,
                    preferences: user.preferences
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
        const user = await User.findById(req.user.id);

        if (!user || !user.roles.includes('customer')) {
            return res.status(404).json({
                success: false,
                message: 'Customer profile not found'
            });
        }

        const updates = { ...req.body };

        // Remove fields that shouldn't be updated directly
        delete updates._id;
        delete updates.email; // Email should not be changed
        delete updates.password; // Password should be updated via separate endpoint
        delete updates.roles; // Roles should not be updated directly
        delete updates.phone; // Phone number should not be changed (for verification purposes)

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    roles: updatedUser.roles,
                    phone: updatedUser.phone,
                    preferences: updatedUser.preferences
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

module.exports = {
    registerCustomer,
    getMyProfile,
    updateProfile
};
