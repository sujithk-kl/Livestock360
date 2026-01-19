const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const reportController = require('../controllers/reportController');

router.use(protect);

// @route   GET /api/reports/milk-production
// @desc    Get milk production report
// @access  Private (Farmer)
router.get('/milk-production', authorize('farmer', 'admin'), reportController.getMilkProductionReport);

// @route   GET /api/reports/product-sales
// @desc    Get product sales summary
// @access  Private (Farmer)
router.get('/product-sales', authorize('farmer', 'admin'), reportController.getProductSalesSummary);

// @route   GET /api/reports/profit-analysis
// @desc    Get profit analysis
// @access  Private (Farmer)
router.get('/profit-analysis', authorize('farmer', 'admin'), reportController.getProfitAnalysis);

module.exports = router;
