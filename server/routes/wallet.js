const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const walletController = require('../controllers/walletController');

// All wallet routes require authentication as a customer
router.use(protect);
router.use(authorize('customer'));

// @route   GET /api/wallet
// @desc    Get current wallet balance and recent transactions
// @access  Private (Customer)
router.get('/', walletController.getWalletDashboard);

// @route   POST /api/wallet/add-funds
// @desc    Add funds via Mock Payment Interface
// @access  Private (Customer)
router.post('/add-funds', walletController.addFunds);

module.exports = router;
