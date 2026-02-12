// Customer Service
import api from './api';

const customerService = {
  // Login customer
  login: async (credentials) => {
    try {
      const response = await api.post('/customers/login', credentials);

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

  // Register a new customer
  registerCustomer: async (customerData) => {
    try {
      const response = await api.post('/customers/register', customerData);

      // Store token and user data for auto-login
      if (response.data.data && response.data.data.user && response.data.data.user.token) {
        localStorage.setItem('token', response.data.data.user.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Customer registration failed' };
    }
  },

  // Get customer profile
  getMyProfile: async () => {
    try {
      const response = await api.get('/customers/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get customer profile' };
    }
  },

  // Update customer profile
  updateProfile: async (updateData) => {
    try {
      const response = await api.put('/customers/me', updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },
  // Change Password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/customers/password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to change password' };
    }
  },
  // Forgot Password
  forgotPassword: async (email) => {
    const response = await api.post('/customers/forgotpassword', { email });
    return response.data;
  },

  // Reset Password
  resetPassword: async (token, password) => {
    const response = await api.put(`/customers/resetpassword/${token}`, { password });
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
      }
    }
    return response.data;
  },
};

export default customerService;
