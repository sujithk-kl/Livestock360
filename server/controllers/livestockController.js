const Livestock = require('../models/Livestock');

// @desc    Create livestock entry
// @route   POST /api/livestock
// @access  Private (Farmer)
const createLivestock = async (req, res) => {
  try {
    const livestock = await Livestock.create({
      farmer: req.user.id,
      animalType: req.body.animalType,
      count: req.body.count,
      healthNotes: req.body.healthNotes,
      vaccinationNotes: req.body.vaccinationNotes
    });

    res.status(201).json({
      success: true,
      data: livestock
    });
  } catch (error) {
    console.error('Error creating livestock:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating livestock',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get livestock list for current farmer
// @route   GET /api/livestock
// @access  Private (Farmer)
const getLivestockList = async (req, res) => {
  try {
    const livestock = await Livestock.find({ farmer: req.user.id }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: livestock
    });
  } catch (error) {
    console.error('Error fetching livestock list:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching livestock',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get livestock by id
// @route   GET /api/livestock/:id
// @access  Private (Farmer)
const getLivestockById = async (req, res) => {
  try {
    const livestock = await Livestock.findOne({ _id: req.params.id, farmer: req.user.id });

    if (!livestock) {
      return res.status(404).json({
        success: false,
        message: 'Livestock record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: livestock
    });
  } catch (error) {
    console.error('Error fetching livestock:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching livestock',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update livestock record
// @route   PUT /api/livestock/:id
// @access  Private (Farmer)
const updateLivestock = async (req, res) => {
  try {
    const livestock = await Livestock.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!livestock) {
      return res.status(404).json({
        success: false,
        message: 'Livestock record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: livestock
    });
  } catch (error) {
    console.error('Error updating livestock:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating livestock',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete livestock record
// @route   DELETE /api/livestock/:id
// @access  Private (Farmer)
const deleteLivestock = async (req, res) => {
  try {
    const livestock = await Livestock.findOneAndDelete({ _id: req.params.id, farmer: req.user.id });

    if (!livestock) {
      return res.status(404).json({
        success: false,
        message: 'Livestock record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Livestock record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting livestock:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting livestock',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createLivestock,
  getLivestockList,
  getLivestockById,
  updateLivestock,
  deleteLivestock
};
