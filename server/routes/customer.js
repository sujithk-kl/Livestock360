const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const customerController = require('../controllers/customerController');
const customerValidator = require('../middleware/validators/customerValidator');

// @route   POST /api/customers/login
// @desc    Login customer
// @access  Public
router.post(
  '/login',
  customerValidator.loginValidation,
  customerController.loginCustomer
);

// @route   POST /api/customers/register
// @desc    Register a new customer (creates user account if needed)
// @access  Public
router.post(
  '/register',
  customerValidator.registerCustomerValidation,
  customerController.registerCustomer
);

// @route   POST /api/customers/forgotpassword
// @desc    Forgot Password
// @access  Public
router.post('/forgotpassword', customerController.forgotPassword);

// @route   PUT /api/customers/resetpassword/:resetToken
// @desc    Reset Password
// @access  Public
router.put('/resetpassword/:resetToken', customerController.resetPassword);

// Apply authentication middleware to all routes below
router.use(protect);

// @route   GET /api/customers/me
// @desc    Get current customer's profile
// @access  Private (Customer only)
router.get(
  '/me',
  authorize('customer', 'admin'),
  customerController.getMyProfile
);

// @route   PUT /api/customers/me
// @desc    Update customer profile
// @access  Private (Customer only)
router.put(
  '/me',
  authorize('customer', 'admin'),
  customerValidator.updateProfileValidation,
  customerController.updateProfile
);

// @route   PUT /api/customers/password
// @desc    Change customer password
// @access  Private
router.put(
  '/password',
  authorize('customer', 'admin'),
  customerController.changePassword
);

module.exports = router;
