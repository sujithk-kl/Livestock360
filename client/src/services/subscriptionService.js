import api from './api';

const subscriptionService = {
    // Create a new subscription
    createSubscription: async (subscriptionData) => {
        try {
            const response = await api.post('/subscriptions', subscriptionData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create subscription' };
        }
    },

    // Get customer's subscriptions
    getMySubscriptions: async () => {
        try {
            const response = await api.get('/subscriptions/my-subscriptions');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch subscriptions' };
        }
    },

    // Get farmer's subscriptions (for delivery prep)
    getFarmerSubscriptions: async () => {
        try {
            const response = await api.get('/subscriptions/farmer');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch farmer subscriptions' };
        }
    },

    // Pause a specific date
    pauseSubscriptionDate: async (id, pauseDateData) => {
        try {
            const response = await api.post(`/subscriptions/${id}/pause-date`, pauseDateData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to pause delivery for this date' };
        }
    },

    // Resume a specific date
    resumeSubscriptionDate: async (id, resumeDateData) => {
        try {
            const response = await api.post(`/subscriptions/${id}/resume-date`, resumeDateData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to resume delivery for this date' };
        }
    },

    // Pause a date range
    pauseSubscriptionRange: async (id, dateRangeData) => {
        try {
            const response = await api.post(`/subscriptions/${id}/pause-range`, dateRangeData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to pause delivery for date range' };
        }
    },

    // Cancel vacation mode (Resume all future)
    cancelVacationMode: async (id) => {
        try {
            const response = await api.post(`/subscriptions/${id}/cancel-vacation`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to cancel vacation mode' };
        }
    },

    // Cancel subscription permanently
    cancelSubscription: async (id) => {
        try {
            const response = await api.put(`/subscriptions/${id}/cancel`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to cancel subscription' };
        }
    },

    // Add an add-on product to a subscription
    addAddon: async (id, addonData) => {
        try {
            const response = await api.post(`/subscriptions/${id}/addons`, addonData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to add extra item' };
        }
    },

    // Remove an add-on from a subscription
    removeAddon: async (id, addonId) => {
        try {
            const response = await api.delete(`/subscriptions/${id}/addons/${addonId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to remove extra item' };
        }
    }
};

export default subscriptionService;
