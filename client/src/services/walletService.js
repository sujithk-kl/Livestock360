import api from './api';

const walletService = {
    // Get current wallet balance and recent transactions
    getWalletDashboard: async () => {
        try {
            const response = await api.get('/wallet');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch wallet dashboard' };
        }
    },

    // Add funds via Mock Payment Interface
    addFunds: async (amount) => {
        try {
            const response = await api.post('/wallet/add-funds', { amount });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to add funds' };
        }
    }
};

export default walletService;
