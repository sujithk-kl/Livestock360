const Farmer = require('../models/Farmer');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Register a new farmer (creates user account if needed)
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
            crops,
            livestock,
            aadharNumber,
            bankDetails,
            documents
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

        // Check if user already has a farmer profile
        const existingFarmer = await Farmer.findOne({ user: user._id });
        if (existingFarmer) {
            return res.status(400).json({
                success: false,
                message: 'Farmer profile already exists for this user'
            });
        }

        // Check if Aadhar number is already registered
        const existingAadhar = await Farmer.findOne({ aadharNumber });
        if (existingAadhar) {
            return res.status(400).json({
                success: false,
                message: 'Aadhar number already registered'
            });
        }

        // Create new farmer profile
        const farmer = new Farmer({
            user: user._id,
            phone,
            address,
            farmSize,
            crops: crops || [],
            livestock: livestock || [],
            aadharNumber,
            bankDetails,
            documents: documents || [],
            isVerified: false
        });

        await farmer.save();

        // Update user role to 'farmer' if not already
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $addToSet: { roles: 'farmer' } },
            { new: true, runValidators: true }
        );

        // Generate token for auto-login
        const jwt = require('jsonwebtoken');
        const generateToken = (id) => {
            return jwt.sign({ id }, process.env.JWT_SECRET, {
                expiresIn: '30d'
            });
        };
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                farmer,
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
        const farmer = await Farmer.findOne({ user: req.user.id })
            .select('-documents.documentUrl') // Don't include document URLs by default
            .populate('user', 'name email');

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: 'Farmer profile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: farmer
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
        const updates = { ...req.body };
        
        // Remove fields that shouldn't be updated directly
        delete updates._id;
        delete updates.user;
        delete updates.aadharNumber; // Aadhar number should not be changed
        delete updates.isVerified;   // Verification status should be managed separately

        const farmer = await Farmer.findOneAndUpdate(
            { user: req.user.id },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: 'Farmer profile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: farmer
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

// @desc    Upload document for verification
// @route   POST /api/farmers/documents
// @access  Private (Farmer only)
const uploadDocument = async (req, res) => {
    try {
        const { documentType, documentUrl } = req.body;

        if (!documentType || !documentUrl) {
            return res.status(400).json({
                success: false,
                message: 'Document type and URL are required'
            });
        }

        const farmer = await Farmer.findOneAndUpdate(
            { user: req.user.id },
            {
                $push: {
                    documents: {
                        documentType,
                        documentUrl,
                        isVerified: false
                    }
                }
            },
            { new: true, runValidators: true }
        );

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: 'Farmer profile not found'
            });
        }

        res.status(201).json({
            success: true,
            data: farmer.documents[farmer.documents.length - 1] // Return the newly added document
        });
    } catch (error) {
        console.error('Error uploading document:', error);
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
    updateProfile,
    uploadDocument
};
