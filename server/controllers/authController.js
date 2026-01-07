// controllers/authController.js
const User = require('../models/User');
const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { name, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create user
        user = new User({
            name,
            email,
            password,
            roles: ['user'] // Default role
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles,
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { email, password } = req.body;

        // First check User collection (for farmers, admins, etc.)
        let account = await User.findOne({ email }).select('+password +failedAttempts +lockUntil');
        let accountType = 'user';

        // If not found in User, check Customer collection
        if (!account) {
            account = await Customer.findOne({ email }).select('+password +failedAttempts +lockUntil');
            accountType = 'customer';
        }

        if (!account) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is locked
        if (account.isLocked) {
            return res.status(401).json({
                success: false,
                message: 'Account locked due to too many failed attempts'
            });
        }

        // Check password
        const isMatch = await account.comparePassword(password);
        if (!isMatch) {
            await account.incLoginAttempts();
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Reset failed attempts on successful login
        await account.resetLoginAttempts();

        // Generate token
        const token = generateToken(account._id);

        res.json({
            success: true,
            data: {
                id: account._id,
                name: account.name,
                email: account.email,
                roles: account.roles,
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
