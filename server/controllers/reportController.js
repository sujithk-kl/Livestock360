const MilkProduction = require('../models/MilkProduction');
const Product = require('../models/Product');
const Staff = require('../models/Staff');

// @desc    Get milk production report grouped by day
// @route   GET /api/reports/milk-production
// @access  Private (Farmer)
const getMilkProductionReport = async (req, res) => {
  try {
    const { start, end } = req.query;
    const match = { farmer: req.user.id };

    if (start || end) {
      match.date = {};
      if (start) {
        match.date.$gte = new Date(start);
      }
      if (end) {
        match.date.$lte = new Date(end);
      }
    }

    const report = await MilkProduction.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalQuantity: { $sum: '$quantity' },
          entries: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: report.map((item) => ({
        date: item._id,
        totalQuantity: item.totalQuantity,
        entries: item.entries
      }))
    });
  } catch (error) {
    console.error('Error generating milk production report:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating milk production report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get product sales summary
// @route   GET /api/reports/product-sales
// @access  Private (Farmer)
const getProductSalesSummary = async (req, res) => {
  try {
    const summary = await Product.aggregate([
      { $match: { farmer: req.user.id } },
      {
        $project: {
          name: 1,
          price: 1,
          availableQuantity: 1,
          soldQuantity: 1,
          revenue: { $multiply: ['$price', '$soldQuantity'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$revenue' },
          totalSoldQuantity: { $sum: '$soldQuantity' },
          products: { $push: '$$ROOT' }
        }
      }
    ]);

    const data = summary[0] || { totalRevenue: 0, totalSoldQuantity: 0, products: [] };

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error generating product sales summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating product sales summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get simple profit analysis
// @route   GET /api/reports/profit-analysis
// @access  Private (Farmer)
const getProfitAnalysis = async (req, res) => {
  try {
    const staffCosts = await Staff.aggregate([
      { $match: { farmer: req.user.id } },
      {
        $group: {
          _id: null,
          totalSalary: { $sum: '$salary' }
        }
      }
    ]);

    const productSales = await Product.aggregate([
      { $match: { farmer: req.user.id } },
      {
        $project: {
          revenue: { $multiply: ['$price', '$soldQuantity'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$revenue' }
        }
      }
    ]);

    const totalRevenue = productSales[0]?.totalRevenue || 0;
    const totalSalary = staffCosts[0]?.totalSalary || 0;
    const profit = totalRevenue - totalSalary;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalSalary,
        profit
      }
    });
  } catch (error) {
    console.error('Error generating profit analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating profit analysis',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getMilkProductionReport,
  getProductSalesSummary,
  getProfitAnalysis
};
