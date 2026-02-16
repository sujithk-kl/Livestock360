const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const reportController = require('../controllers/reportController');

router.use(protect);

// @route   GET /api/reports/monthly
// @desc    Get monthly profit report (Revenue, Expenses, Profit)
// @access  Private (Farmer)
router.get('/monthly', authorize('farmer'), reportController.getMonthlyReport);

module.exports = router;
