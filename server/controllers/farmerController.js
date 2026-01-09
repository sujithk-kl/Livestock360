const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Register a new farmer (creates user account with farmer data)
// @route   POST /api/farmers/register
// @access  Public
const registerFarmer = async (req, res) => {
    console.log('Farmer registration request body:', JSON.stringify(req.body, null, 2));

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
            address,
            farmSize,
            farmName,
            farmAddress,
            farmType,
            yearsOfFarming,
            crops,
            livestock,
            aadharNumber,
            bankDetails
        } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Check if Aadhar number is already registered
        const existingAadhar = await User.findOne({ aadharNumber });
        if (existingAadhar) {
            return res.status(400).json({
                success: false,
                message: 'Aadhar number already registered'
            });
        }

        // Create new farmer user with all data in User collection
        const newUser = new User({
            name,
            email,
            password,
            roles: ['user', 'farmer'],
            phone,
            address,
            farmSize,
            farmName,
            farmAddress,
            farmType,
            yearsOfFarming,
            crops: crops || [],
            livestock: livestock || [],
            aadharNumber,
            bankDetails
        });

        await newUser.save();
        console.log('Farmer user created successfully:', newUser.email);

        // Generate token for auto-login
        const jwt = require('jsonwebtoken');
        const generateToken = (id) => {
            return jwt.sign({ id }, process.env.JWT_SECRET, {
                expiresIn: '30d'
            });
        };
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
                    address: newUser.address,
                    farmSize: newUser.farmSize,
                    farmName: newUser.farmName,
                    farmAddress: newUser.farmAddress,
                    farmType: newUser.farmType,
                    yearsOfFarming: newUser.yearsOfFarming,
                    crops: newUser.crops,
                    livestock: newUser.livestock,
                    aadharNumber: newUser.aadharNumber,
                    bankDetails: newUser.bankDetails,
                    token
                }
            }
        });

    } catch (error) {
        console.error('Error registering farmer:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get current farmer's profile
// @route   GET /api/farmers/me
// @access  Private (Farmer only)
const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user || !user.roles.includes('farmer')) {
            return res.status(404).json({
                success: false,
                message: 'Farmer profile not found'
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
                    address: user.address,
                    farmSize: user.farmSize,
                    farmName: user.farmName,
                    farmAddress: user.farmAddress,
                    farmType: user.farmType,
                    yearsOfFarming: user.yearsOfFarming,
                    crops: user.crops,
                    livestock: user.livestock,
                    aadharNumber: user.aadharNumber,
                    bankDetails: user.bankDetails
                }
            }
        });
    } catch (error) {
        console.error('Error fetching farmer profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Update farmer profile
// @route   PUT /api/farmers/me
// @access  Private (Farmer only)
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user || !user.roles.includes('farmer')) {
            return res.status(404).json({
                success: false,
                message: 'Farmer profile not found'
            });
        }

        const updates = { ...req.body };

        // Remove fields that shouldn't be updated directly
        delete updates._id;
        delete updates.email; // Email should not be changed
        delete updates.password; // Password should be updated via separate endpoint
        delete updates.roles; // Roles should not be updated directly
        delete updates.aadharNumber; // Aadhar number should not be changed

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
                    address: updatedUser.address,
                    farmSize: updatedUser.farmSize,
                    farmName: updatedUser.farmName,
                    farmAddress: updatedUser.farmAddress,
                    farmType: updatedUser.farmType,
                    yearsOfFarming: updatedUser.yearsOfFarming,
                    crops: updatedUser.crops,
                    livestock: updatedUser.livestock,
                    aadharNumber: updatedUser.aadharNumber,
                    bankDetails: updatedUser.bankDetails
                }
            }
        });
    } catch (error) {
        console.error('Error updating farmer profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    registerFarmer,
    getMyProfile,
    updateProfile
};
