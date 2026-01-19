const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const milkProductionController = require('../controllers/milkProductionController');

router.use(protect);

// @route   POST /api/milk-production
// @desc    Create daily milk production entry
// @access  Private (Farmer)
router.post('/', authorize('farmer', 'admin'), milkProductionController.createMilkProduction);

// @route   GET /api/milk-production
// @desc    Get milk production history
// @access  Private (Farmer)
router.get('/', authorize('farmer', 'admin'), milkProductionController.getMilkProductionHistory);

// @route   GET /api/milk-production/:id
// @desc    Get milk production entry by id
// @access  Private (Farmer)
router.get('/:id', authorize('farmer', 'admin'), milkProductionController.getMilkProductionById);

// @route   PUT /api/milk-production/:id
// @desc    Update milk production entry
// @access  Private (Farmer)
router.put('/:id', authorize('farmer', 'admin'), milkProductionController.updateMilkProduction);

// @route   DELETE /api/milk-production/:id
// @desc    Delete milk production entry
// @access  Private (Farmer)
router.delete('/:id', authorize('farmer', 'admin'), milkProductionController.deleteMilkProduction);

module.exports = router;
