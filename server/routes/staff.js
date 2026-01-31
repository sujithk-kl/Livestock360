const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const staffController = require('../controllers/staffController');

router.use(protect);

// @route   POST /api/staff
// @desc    Create staff member
// @access  Private (Farmer)
router.post('/', authorize('farmer', 'admin'), staffController.createStaff);

// @route   GET /api/staff
// @desc    Get staff list
// @access  Private (Farmer)
router.get('/', authorize('farmer', 'admin'), staffController.getStaffList);

// @route   GET /api/staff/stats/dashboard
// @desc    Get staff dashboard stats
// @access  Private (Farmer)
router.get('/stats/dashboard', authorize('farmer', 'admin'), staffController.getDashboardStats);

// @route   GET /api/staff/:id
// @desc    Get staff member by id
// @access  Private (Farmer)
router.get('/:id', authorize('farmer', 'admin'), staffController.getStaffById);

// @route   PUT /api/staff/:id
// @desc    Update staff member
// @access  Private (Farmer)
router.put('/:id', authorize('farmer', 'admin'), staffController.updateStaff);

// @route   POST /api/staff/:id/attendance
// @desc    Add attendance entry
// @access  Private (Farmer)
router.post('/:id/attendance', authorize('farmer', 'admin'), staffController.addAttendance);

// @route   DELETE /api/staff/:id
// @desc    Delete staff member
// @access  Private (Farmer)
router.delete('/:id', authorize('farmer', 'admin'), staffController.deleteStaff);

module.exports = router;
