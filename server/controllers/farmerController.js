const Farmer = require('../models/Farmer');
const mongoose = require('mongoose');
const Livestock = require('../models/Livestock');
const Product = require('../models/Product');
const MilkProduction = require('../models/MilkProduction');
const Order = require('../models/Order');
const Review = require('../models/Review');
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
        const farmer = await Farmer.findOne({ email }).select('+password');

        if (!farmer) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await farmer.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

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




// @desc    Get dashboard statistics
// @route   GET /api/farmers/dashboard
// @access  Private (Farmer only)
const getDashboardStats = async (req, res) => {
    try {
        const farmerId = req.user.id;

        // 1. Get Farmer Profile for Farm Size
        const farmer = await Farmer.findById(farmerId);
        if (!farmer) {
            return res.status(404).json({ success: false, message: 'Farmer not found' });
        }

        // 2. Get Total Livestock Count
        // Summing up the 'count' field of all livestock entries for this farmer
        const livestockStats = await Livestock.aggregate([
            { $match: { farmer: farmer._id } },
            { $group: { _id: null, totalCount: { $sum: "$count" } } }
        ]);
        const totalLivestock = livestockStats.length > 0 ? livestockStats[0].totalCount : 0;

        // 3. Get Products Listed Count
        // Counting number of product documents
        const totalProducts = await Product.countDocuments({ farmer: farmerId });

        // 4. Get Milk Produced Today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const milkStats = await MilkProduction.aggregate([
            {
                $match: {
                    farmer: farmer._id,
                    date: { $gte: startOfDay, $lte: endOfDay }
                }
            },
            { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } }
        ]);
        const milkToday = milkStats.length > 0 ? milkStats[0].totalQuantity : 0;

        res.status(200).json({
            success: true,
            data: {
                totalLivestock,
                productsListed: totalProducts,
                milkToday: milkToday, // in Litres
                farmSize: farmer.farmSize // assuming farmSize is a number or string in profile
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get sales report (orders containing farmer's products)
// @route   GET /api/farmers/sales-report
// @access  Private (Farmer only)
const getSalesReport = async (req, res) => {
    try {
        const farmerId = req.user.id;

        // Aggregation pipeline to get robust data
        const sales = await Order.aggregate([
            // 1. Find orders that contain items from this farmer
            { $match: { "items.farmer": new mongoose.Types.ObjectId(farmerId) } },

            // 2. Unwind items to filter specific products from this farmer
            { $unwind: "$items" },

            // 3. Match only the items that belong to this farmer
            { $match: { "items.farmer": new mongoose.Types.ObjectId(farmerId) } },

            // 4. Lookup Customer details
            {
                $lookup: {
                    from: "customers", // collection name for Customer model
                    localField: "customer",
                    foreignField: "_id",
                    as: "customerParams"
                }
            },
            { $unwind: { path: "$customerParams", preserveNullAndEmptyArrays: true } },

            // 5. Lookup Review for this product by this customer
            {
                $lookup: {
                    from: "reviews",
                    let: { productId: "$items.product", customerId: "$customer" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$product", "$$productId"] },
                                        { $eq: ["$user", "$$customerId"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "reviewParams"
                }
            },
            { $unwind: { path: "$reviewParams", preserveNullAndEmptyArrays: true } },

            // 6. Project final shape
            {
                $project: {
                    _id: 1, // Order ID
                    date: "$createdAt",
                    customerName: { $ifNull: ["$customerParams.name", "Unknown Customer"] },
                    customerEmail: "$customerParams.email",
                    productName: "$items.productName",
                    category: "$items.category",
                    quantity: "$items.quantity",
                    unit: "$items.unit",
                    price: "$items.price",
                    total: "$items.total",
                    rating: { $ifNull: ["$reviewParams.rating", null] }, // Rating if exists, else null
                    reviewComment: { $ifNull: ["$reviewParams.comment", null] }
                }
            },
            // 7. Sort by date descending
            { $sort: { date: -1 } }
        ]);

        res.status(200).json({
            success: true,
            count: sales.length,
            data: sales
        });

    } catch (error) {
        console.error('Error fetching sales report:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    loginFarmer,
    registerFarmer,
    getMyProfile,
    updateProfile,
    changePassword,
    getDashboardStats,
    getSalesReport
};
