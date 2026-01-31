const Staff = require('../models/Staff');

// @desc    Create staff member
// @route   POST /api/staff
// @access  Private (Farmer)
const createStaff = async (req, res) => {
  try {
    const staffMember = await Staff.create({
      farmer: req.user.id,
      name: req.body.name,
      phone: req.body.phone,
      role: req.body.role,
      salary: req.body.salary,
      dateOfJoining: req.body.dateOfJoining,
      wageType: req.body.wageType,
      status: req.body.status,
      wageType: req.body.wageType,
      status: req.body.status,
      attendance: req.body.attendance || []
    });

    res.status(201).json({
      success: true,
      data: staffMember
    });
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating staff',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get staff list
// @route   GET /api/staff
// @access  Private (Farmer)
const getStaffList = async (req, res) => {
  try {
    const staff = await Staff.find({ farmer: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Error fetching staff list:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching staff',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get staff member by id
// @route   GET /api/staff/:id
// @access  Private (Farmer)
const getStaffById = async (req, res) => {
  try {
    const staffMember = await Staff.findOne({ _id: req.params.id, farmer: req.user.id });

    if (!staffMember) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.status(200).json({
      success: true,
      data: staffMember
    });
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching staff member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private (Farmer)
const updateStaff = async (req, res) => {
  try {
    const staffMember = await Staff.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!staffMember) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.status(200).json({
      success: true,
      data: staffMember
    });
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating staff member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Add attendance entry
// @route   POST /api/staff/:id/attendance
// @access  Private (Farmer)
const addAttendance = async (req, res) => {
  try {
    const staffMember = await Staff.findOne({ _id: req.params.id, farmer: req.user.id });

    if (!staffMember) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    const newDateStr = new Date(req.body.date).toISOString().split('T')[0];

    // Check if attendance for this date already exists
    const existingIndex = staffMember.attendance.findIndex(a => {
      const aDateStr = new Date(a.date).toISOString().split('T')[0];
      return aDateStr === newDateStr;
    });

    if (existingIndex !== -1) {
      // Update existing
      staffMember.attendance[existingIndex].status = req.body.status;
      staffMember.attendance[existingIndex].notes = req.body.notes;
    } else {
      // Add new
      staffMember.attendance.push({
        date: req.body.date,
        status: req.body.status,
        notes: req.body.notes
      });
    }

    await staffMember.save();

    res.status(200).json({
      success: true,
      data: staffMember
    });
  } catch (error) {
    console.error('Error adding attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Private (Farmer)


// @desc    Get dashboard stats
// @route   GET /api/staff/stats/dashboard
// @access  Private (Farmer)
const getDashboardStats = async (req, res) => {
  try {
    const staff = await Staff.find({ farmer: req.user.id });

    const totalStaff = staff.length;

    // Calculate today's attendance
    const todayStr = new Date().toISOString().split('T')[0];

    let presentCount = 0;

    staff.forEach(member => {
      if (member.status !== 'active') return;

      const todayAttendance = member.attendance.find(a => {
        const aDateStr = new Date(a.date).toISOString().split('T')[0];
        return aDateStr === todayStr;
      });

      if (todayAttendance) {
        if (todayAttendance.status === 'present' || todayAttendance.status === 'half-day') {
          presentCount++;
        }
      }
    });

    const activeStaffCount = staff.filter(s => s.status === 'active').length;
    const attendancePercentage = activeStaffCount > 0 ? ((presentCount / activeStaffCount) * 100).toFixed(1) : 0;

    // Estimate monthly expense
    let estimatedMonthlyExpense = 0;
    staff.forEach(member => {
      if (member.status !== 'active') return;

      if (member.wageType === 'monthly') {
        estimatedMonthlyExpense += member.salary;
      } else if (member.wageType === 'daily') {
        // Assuming 30 days for estimation
        estimatedMonthlyExpense += (member.salary * 30);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalStaff,
        attendancePercentage,
        presentCount,
        estimatedMonthlyExpense
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const staffMember = await Staff.findOneAndDelete({ _id: req.params.id, farmer: req.user.id });

    if (!staffMember) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting staff member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createStaff,
  getStaffList,
  getStaffById,
  updateStaff,
  addAttendance,
  deleteStaff,
  getDashboardStats
};
