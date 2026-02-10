const Farmer = require('../models/Farmer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

// Login farmer
const loginFarmer = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { email, password } = req.body;

        // Check farmer
        const farmer = await Farmer.findOne({ email }).select('+password +failedAttempts +lockUntil');

        if (!farmer) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is locked
        if (farmer.isLocked) {
            return res.status(401).json({
                success: false,
                message: 'Account locked due to too many failed attempts'
            });
        }

        // Check password
        const isMatch = await farmer.comparePassword(password);
        if (!isMatch) {
            await farmer.incLoginAttempts();
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Reset failed attempts on successful login
        await farmer.resetLoginAttempts();

        // Generate token
        const token = generateToken(farmer._id);


        if (res.headersSent) return;

        res.json({
            success: true,
            data: {
                id: farmer._id,
                name: farmer.name,
                email: farmer.email,
                roles: ['farmer'],
                phone: farmer.phone,
                address: farmer.address,
                farmSize: farmer.farmSize,
                farmName: farmer.farmName,
                farmAddress: farmer.farmAddress,
                farmType: farmer.farmType,
                yearsOfFarming: farmer.yearsOfFarming,
                crops: farmer.crops,
                livestock: farmer.livestock,
                aadharNumber: farmer.aadharNumber,
                bankDetails: farmer.getDecryptedBankDetails ? farmer.getDecryptedBankDetails() : farmer.bankDetails,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);

        if (res.headersSent) return;

        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register a new farmer
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

        // Check if farmer already exists
        let farmer = await Farmer.findOne({ email });
        if (farmer) {
            return res.status(400).json({
                success: false,
                message: 'Farmer already exists with this email'
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

        // Create farmer
        const newFarmer = new Farmer({
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
            crops: crops || [],
            livestock: livestock || [],
            aadharNumber,
            bankDetails
        });

        await newFarmer.save();
        console.log('Farmer created successfully:', newFarmer.email);

        // Generate token for auto-login
        const token = generateToken(newFarmer._id);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: newFarmer._id,
                    name: newFarmer.name,
                    email: newFarmer.email,
                    roles: ['farmer'],
                    phone: newFarmer.phone,
                    address: newFarmer.address,
                    farmSize: newFarmer.farmSize,
                    farmName: newFarmer.farmName,
                    farmAddress: newFarmer.farmAddress,
                    farmType: newFarmer.farmType,
                    yearsOfFarming: newFarmer.yearsOfFarming,
                    crops: newFarmer.crops,
                    livestock: newFarmer.livestock,
                    aadharNumber: newFarmer.aadharNumber,
                    bankDetails: newFarmer.getDecryptedBankDetails ? newFarmer.getDecryptedBankDetails() : newFarmer.bankDetails,
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
        const farmer = await Farmer.findById(req.user.id);

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: 'Farmer profile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: farmer._id,
                    name: farmer.name,
                    email: farmer.email,
                    roles: ['farmer'],
                    phone: farmer.phone,
                    address: farmer.address,
                    farmSize: farmer.farmSize,
                    farmName: farmer.farmName,
                    farmAddress: farmer.farmAddress,
                    farmType: farmer.farmType,
                    yearsOfFarming: farmer.yearsOfFarming,
                    crops: farmer.crops,
                    livestock: farmer.livestock,
                    aadharNumber: farmer.aadharNumber,
                    bankDetails: farmer.getDecryptedBankDetails ? farmer.getDecryptedBankDetails() : farmer.bankDetails
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
        const farmer = await Farmer.findById(req.user.id);

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: 'Farmer profile not found'
            });
        }

        const updates = { ...req.body };

        // Remove fields that shouldn't be updated
        delete updates._id;
        delete updates.email; // Email should not be changed
        delete updates.password; // Password should be updated via separate endpoint
        delete updates.aadharNumber; // Aadhar number should not be changed

        // Update farmer
        const updatedFarmer = await Farmer.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: updatedFarmer._id,
                    name: updatedFarmer.name,
                    email: updatedFarmer.email,
                    roles: ['farmer'],
                    phone: updatedFarmer.phone,
                    address: updatedFarmer.address,
                    farmSize: updatedFarmer.farmSize,
                    farmName: updatedFarmer.farmName,
                    farmAddress: updatedFarmer.farmAddress,
                    farmType: updatedFarmer.farmType,
                    yearsOfFarming: updatedFarmer.yearsOfFarming,
                    crops: updatedFarmer.crops,
                    livestock: updatedFarmer.livestock,
                    aadharNumber: updatedFarmer.aadharNumber,
                    bankDetails: updatedFarmer.getDecryptedBankDetails ? updatedFarmer.getDecryptedBankDetails() : updatedFarmer.bankDetails
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

// @desc    Change farmer password
// @route   PUT /api/farmers/password
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

        const farmer = await Farmer.findById(req.user.id).select('+password');

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: 'Farmer not found'
            });
        }

        // Check if current password matches
        const isMatch = await farmer.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect current password'
            });
        }

        // Update password (pre-save hook will hash it)
        farmer.password = newPassword;
        await farmer.save();

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
// @route   POST /api/farmers/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    console.log(`[forgotPassword] Request received for email: ${email}`);

    try {
        const farmer = await Farmer.findOne({ email });

        if (!farmer) {
            console.log(`[forgotPassword] User not found for email: ${email}`);
            return res.status(404).json({ success: false, message: 'User not found with this email' });
        }
        console.log(`[forgotPassword] User found: ${farmer._id}`);

        // Get Reset Token
        const resetToken = farmer.getResetPasswordToken();

        await farmer.save({ validateBeforeSave: false });

        // Create Reset URL
        // Example: http://localhost:3000/reset-password/token
        // We will receive the frontend base URL or assume standard
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
        console.log(`[forgotPassword] Reset URL generated: ${resetUrl}`);

        const message = `
      <h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;

        try {
            const sendEmail = require('../utils/sendEmail');

            // Send email synchronously (await so we know if it failed)
            console.log('[forgotPassword] Calling sendEmail...');
            await sendEmail({
                email: farmer.email,
                subject: 'Password Reset Request',
                message
            });
            console.log('[forgotPassword] sendEmail completed successfully');

            res.status(200).json({
                success: true,
                data: 'Email sent'
            });

        } catch (error) {
            console.error('[forgotPassword] sendEmail failed:', error);
            return res.status(500).json({ success: false, message: 'Email could not be sent', error: error.message });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reset Password
// @route   PUT /api/farmers/resetpassword/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    try {
        const farmer = await Farmer.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!farmer) {
            return res.status(400).json({ success: false, message: 'Invalid Token' });
        }

        farmer.password = req.body.password;
        farmer.resetPasswordToken = undefined;
        farmer.resetPasswordExpire = undefined;

        await farmer.save();

        res.status(201).json({
            success: true,
            data: 'Password Reset Success',
            token: generateToken(farmer._id)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    loginFarmer,
    registerFarmer,
    getMyProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword
};
