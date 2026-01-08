// Farmer Service
import api from './api';

const farmerService = {
  // Register a new farmer
  registerFarmer: async (farmerData) => {
    try {
      const response = await api.post('/farmers/register', farmerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Farmer registration failed' };
    }
  },

  // Get farmer profile
  getMyProfile: async () => {
    try {
      const response = await api.get('/farmers/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get farmer profile' };
    }
  },

  // Update farmer profile
  updateProfile: async (updateData) => {
    try {
      const response = await api.put('/farmers/me', updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },
};

export default farmerService;
