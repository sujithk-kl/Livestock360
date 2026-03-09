const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const subscriptionController = require('../controllers/subscriptionController');

// All subscription routes require authentication
router.use(protect);

// @route   POST /api/subscriptions
// @desc    Create a daily subscription for a product
// @access  Private (Customer)
router.post('/', authorize('customer'), subscriptionController.createSubscription);

// @route   GET /api/subscriptions/my-subscriptions
// @desc    Get subscriptions for the logged-in customer
// @access  Private (Customer)
router.get('/my-subscriptions', authorize('customer'), subscriptionController.getMySubscriptions);

// @route   GET /api/subscriptions/farmer
// @desc    Get subscriptions for the logged-in farmer
// @access  Private (Farmer)
router.get('/farmer', authorize('farmer', 'admin'), subscriptionController.getFarmerSubscriptions);

// @route   POST /api/subscriptions/:id/pause-date
// @desc    Pause/Skip a specific date for a subscription
// @access  Private (Customer)
router.post('/:id/pause-date', authorize('customer'), subscriptionController.pauseSubscriptionDate);

// @route   POST /api/subscriptions/:id/resume-date
// @desc    Resume a specific paused date for a subscription
// @access  Private (Customer)
router.post('/:id/resume-date', authorize('customer'), subscriptionController.resumeSubscriptionDate);

// @route   POST /api/subscriptions/:id/pause-range
// @desc    Add a range of paused dates for a subscription
// @access  Private (Customer)
router.post('/:id/pause-range', authorize('customer'), subscriptionController.pauseSubscriptionRange);

// @route   POST /api/subscriptions/:id/cancel-vacation
// @desc    Resume all future paused dates
// @access  Private (Customer)
router.post('/:id/cancel-vacation', authorize('customer'), subscriptionController.cancelVacationMode);

// @route   PUT /api/subscriptions/:id/cancel
// @desc    Cancel a subscription completely and issue prorated refund to wallet
// @access  Private (Customer)
router.put('/:id/cancel', authorize('customer'), subscriptionController.cancelSubscription);

// @route   POST /api/subscriptions/:id/addons
// @desc    Add an add-on product to a subscription (same farmer only)
// @access  Private (Customer)
router.post('/:id/addons', authorize('customer'), subscriptionController.addAddon);

// @route   DELETE /api/subscriptions/:id/addons/:addonId
// @desc    Remove an add-on from a subscription
// @access  Private (Customer)
router.delete('/:id/addons/:addonId', authorize('customer'), subscriptionController.removeAddon);

module.exports = router;
