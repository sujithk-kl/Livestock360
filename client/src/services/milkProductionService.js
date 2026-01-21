import api from './api';

const milkProductionService = {
    // Get milk production history (filters optional: start, end dates)
    getHistory: async (filters = {}) => {
        try {
            const params = {};
            if (filters.start) params.start = filters.start;
            if (filters.end) params.end = filters.end;

            const response = await api.get('/milk-production', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch milk production history' };
        }
    },

    // Get single entry by ID
    getById: async (id) => {
        try {
            const response = await api.get(`/milk-production/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch milk production entry' };
        }
    },

    // Create new entry
    create: async (data) => {
        try {
            const response = await api.post('/milk-production', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create milk production record' };
        }
    },

    // Update existing entry
    update: async (id, data) => {
        try {
            const response = await api.put(`/milk-production/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update milk production record' };
        }
    },

    // Delete entry
    delete: async (id) => {
        try {
            const response = await api.delete(`/milk-production/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete milk production record' };
        }
    }
};

export default milkProductionService;
