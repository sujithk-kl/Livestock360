const MilkProduction = require('../models/MilkProduction');
const Order = require('../models/Order');
const Staff = require('../models/Staff');
const asyncHandler = require('express-async-handler');

// @desc    Get monthly report (Revenue, Expenses, Profit)
// @route   GET /api/reports/monthly
// @access  Private (Farmer)
const getMonthlyReport = asyncHandler(async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    res.status(400);
    throw new Error('Please provide month and year');
  }

  // Create Date objects for the start and end of the month
  // Note: Month in JS Date is 0-indexed (0 = Jan, 11 = Dec)
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  // 1. Milk Revenue
  const milkProduction = await MilkProduction.find({
    farmer: req.user.id,
    date: { $gte: startDate, $lte: endDate }
  });

  const milkRevenue = milkProduction.reduce((acc, curr) => acc + curr.totalAmount, 0);

  // 2. Product Sales Revenue
  // Find orders that are 'Success' and paid within the month
  const orders = await Order.find({
    paymentStatus: 'Success',
    paymentDate: { $gte: startDate, $lte: endDate },
    'items.farmer': req.user.id
  });

  let productRevenue = 0;
  const productSales = [];

  orders.forEach(order => {
    order.items.forEach(item => {
      // Check if item belongs to this farmer AND data integrity
      if (item.farmer && item.farmer.toString() === req.user.id) {
        productRevenue += item.total;
        productSales.push({
          date: order.paymentDate,
          productName: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          total: item.total
        });
      }
    });
  });

  // 3. Staff Expenses
  const staffMembers = await Staff.find({
    farmer: req.user.id,
    status: 'active'
  });

  let staffExpenses = 0;
  const staffDetails = [];

  staffMembers.forEach(staff => {
    let monthlyWage = 0;

    if (staff.wageType === 'monthly') {
      // Simplification: Full salary for the month
      monthlyWage = staff.salary;
    } else if (staff.wageType === 'daily') {
      // Calculate based on attendance
      const attendanceInMonth = staff.attendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
      });

      let daysWorked = 0;
      attendanceInMonth.forEach(record => {
        if (record.status === 'present') daysWorked += 1;
        if (record.status === 'half-day') daysWorked += 0.5;
      });

      monthlyWage = daysWorked * staff.salary;
    }

    staffExpenses += monthlyWage;
    if (monthlyWage > 0) {
      staffDetails.push({
        name: staff.name,
        role: staff.role,
        wageType: staff.wageType,
        amount: monthlyWage
      });
    }
  });

  res.status(200).json({
    period: { month, year },
    revenue: {
      milk: milkRevenue,
      products: productRevenue,
      total: milkRevenue + productRevenue
    },
    expenses: {
      staff: staffExpenses,
      total: staffExpenses
    },
    netProfit: (milkRevenue + productRevenue) - staffExpenses,
    details: {
      milkProductionCount: milkProduction.length,
      productSalesCount: productSales.length,
      staffCount: staffDetails.length,
      productSales,
      staffDetails
    }
  });
});

module.exports = {
  getMonthlyReport
};
