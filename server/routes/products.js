const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const productController = require('../controllers/productController');

router.use(protect);

// @route   POST /api/products
// @desc    Create product
// @access  Private (Farmer)
router.post('/', authorize('farmer', 'admin'), productController.createProduct);

// @route   GET /api/products
// @desc    Get products
// @access  Private (Farmer)
router.get('/', authorize('farmer', 'admin'), productController.getProducts);

// @route   GET /api/products/:id
// @desc    Get product by id
// @access  Private (Farmer)
router.get('/:id', authorize('farmer', 'admin'), productController.getProductById);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Farmer)
router.put('/:id', authorize('farmer', 'admin'), productController.updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Farmer)
router.delete('/:id', authorize('farmer', 'admin'), productController.deleteProduct);

module.exports = router;
