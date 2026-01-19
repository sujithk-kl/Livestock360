const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const livestockController = require('../controllers/livestockController');

router.use(protect);

// @route   POST /api/livestock
// @desc    Create livestock entry
// @access  Private (Farmer)
router.post('/', authorize('farmer', 'admin'), livestockController.createLivestock);

// @route   GET /api/livestock
// @desc    Get livestock list
// @access  Private (Farmer)
router.get('/', authorize('farmer', 'admin'), livestockController.getLivestockList);

// @route   GET /api/livestock/:id
// @desc    Get livestock by id
// @access  Private (Farmer)
router.get('/:id', authorize('farmer', 'admin'), livestockController.getLivestockById);

// @route   PUT /api/livestock/:id
// @desc    Update livestock
// @access  Private (Farmer)
router.put('/:id', authorize('farmer', 'admin'), livestockController.updateLivestock);

// @route   DELETE /api/livestock/:id
// @desc    Delete livestock
// @access  Private (Farmer)
router.delete('/:id', authorize('farmer', 'admin'), livestockController.deleteLivestock);

module.exports = router;
