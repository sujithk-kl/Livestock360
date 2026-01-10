// Farmer Service
import api from './api';

const farmerService = {
  // Login farmer
  login: async (credentials) => {
    try {
      const response = await api.post('/farmers/login', credentials);

      // Store token and user data
      if (response.data.data && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Register a new farmer
  registerFarmer: async (farmerData) => {
    try {
      const response = await api.post('/farmers/register', farmerData);

      // Store token and user data for auto-login
      if (response.data.data && response.data.data.user && response.data.data.user.token) {
        localStorage.setItem('token', response.data.data.user.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }

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
