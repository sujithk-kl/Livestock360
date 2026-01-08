const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const farmerController = require('../controllers/farmerController');
const farmerValidator = require('../middleware/validators/farmerValidator');

// @route   POST /api/farmers/register
// @desc    Register a new farmer (creates user account if needed)
// @access  Public
router.post(
  '/register',
  farmerValidator.registerFarmerValidation,
  farmerController.registerFarmer
);

// Apply authentication middleware to all routes below
router.use(protect);

// @route   GET /api/farmers/me
// @desc    Get current farmer's profile
// @access  Private (Farmer only)
router.get(
  '/me',
  authorize('farmer', 'admin'),
  farmerController.getMyProfile
);

// @route   PUT /api/farmers/me
// @desc    Update farmer profile
// @access  Private (Farmer only)
router.put(
  '/me',
  authorize('farmer', 'admin'),
  farmerValidator.updateProfileValidation,
  farmerController.updateProfile
);

module.exports = router;
