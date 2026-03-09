const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');

// @desc    Get current wallet balance and transaction history
// @route   GET /api/wallet
// @access  Private (Customer)
const getWalletDashboard = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user.id).select('walletBalance');

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const transactions = await Transaction.find({ customer: req.user.id })
            .sort({ createdAt: -1 }) // Newest first
            .limit(50); // Show last 50 transactions

        res.status(200).json({
            success: true,
            data: {
                balance: customer.walletBalance || 0,
                transactions
            }
        });
    } catch (error) {
        console.error('Error fetching wallet dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching wallet details'
        });
    }
};

// @desc    Add funds to wallet (Mock Payment Gateway)
// @route   POST /api/wallet/add-funds
// @access  Private (Customer)
const addFunds = async (req, res) => {
    try {
        const { amount } = req.body;
        const parsedAmount = parseFloat(amount);

        if (!parsedAmount || parsedAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Please provide a valid amount' });
        }

        const customer = await Customer.findById(req.user.id);

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Calculate new balance
        const currentBalance = customer.walletBalance || 0;
        const newBalance = currentBalance + parsedAmount;

        // 1. Log the transaction ledger
        const transaction = await Transaction.create({
            customer: req.user.id,
            type: 'CREDIT',
            amount: parsedAmount,
            description: 'Funds added via Top-Up (Mock)',
            balanceAfter: newBalance
        });

        // 2. Update the actual wallet balance
        customer.walletBalance = newBalance;
        await customer.save();

        res.status(200).json({
            success: true,
            message: `₹${parsedAmount} successfully added to your wallet!`,
            data: {
                balance: newBalance,
                transaction
            }
        });

    } catch (error) {
        console.error('Error adding funds:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding funds'
        });
    }
};

module.exports = {
    getWalletDashboard,
    addFunds
};
