const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const productController = require('../controllers/productController');

// Public routes
// @route   GET /api/products
// @desc    Get all products (for customers)
// @access  Public
router.get('/', productController.getAllProducts);

// @route   GET /api/products/:id
// @desc    Get product by id
// @access  Public
router.get('/:id', productController.getProductById);

// Protected routes (Farmer only)
router.use(protect);

// @route   POST /api/products
// @desc    Create product
// @access  Private (Farmer)
router.post('/', authorize('farmer', 'admin'), productController.createProduct);

// @route   GET /api/products/farmer/me
// @desc    Get logged in farmer's products
// @access  Private (Farmer)
router.get('/farmer/me', authorize('farmer', 'admin'), productController.getFarmerProducts);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Farmer)
router.put('/:id', authorize('farmer', 'admin'), productController.updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Farmer)
router.delete('/:id', authorize('farmer', 'admin'), productController.deleteProduct);

module.exports = router;
