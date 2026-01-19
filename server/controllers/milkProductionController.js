const MilkProduction = require('../models/MilkProduction');

// @desc    Create daily milk production entry
// @route   POST /api/milk-production
// @access  Private (Farmer)
const createMilkProduction = async (req, res) => {
  try {
    const { date, quantity, notes } = req.body;

    const existingEntry = await MilkProduction.findOne({ farmer: req.user.id, date });
    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: 'Milk production for this date already exists. Please update the entry.'
      });
    }

    const entry = await MilkProduction.create({
      farmer: req.user.id,
      date,
      quantity,
      notes
    });

    res.status(201).json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Error creating milk production:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating milk production',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get milk production history
// @route   GET /api/milk-production
// @access  Private (Farmer)
const getMilkProductionHistory = async (req, res) => {
  try {
    const { start, end } = req.query;
    const filter = { farmer: req.user.id };

    if (start || end) {
      filter.date = {};
      if (start) {
        filter.date.$gte = new Date(start);
      }
      if (end) {
        filter.date.$lte = new Date(end);
      }
    }

    const entries = await MilkProduction.find(filter).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: entries
    });
  } catch (error) {
    console.error('Error fetching milk production history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching milk production history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get milk production entry by id
// @route   GET /api/milk-production/:id
// @access  Private (Farmer)
const getMilkProductionById = async (req, res) => {
  try {
    const entry = await MilkProduction.findOne({ _id: req.params.id, farmer: req.user.id });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Milk production entry not found'
      });
    }

    res.status(200).json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Error fetching milk production entry:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching milk production entry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update milk production entry
// @route   PUT /api/milk-production/:id
// @access  Private (Farmer)
const updateMilkProduction = async (req, res) => {
  try {
    const entry = await MilkProduction.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Milk production entry not found'
      });
    }

    res.status(200).json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Error updating milk production entry:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating milk production entry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete milk production entry
// @route   DELETE /api/milk-production/:id
// @access  Private (Farmer)
const deleteMilkProduction = async (req, res) => {
  try {
    const entry = await MilkProduction.findOneAndDelete({ _id: req.params.id, farmer: req.user.id });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Milk production entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Milk production entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting milk production entry:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting milk production entry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createMilkProduction,
  getMilkProductionHistory,
  getMilkProductionById,
  updateMilkProduction,
  deleteMilkProduction
};
