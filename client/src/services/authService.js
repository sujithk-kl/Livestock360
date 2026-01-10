// Authentication Service
import farmerService from './farmerService';
import customerService from './customerService';

const authService = {
  // Login farmer or customer
  login: async (credentials, role) => {
    if (role === 'farmer') {
      return await farmerService.login(credentials);
    } else if (role === 'customer') {
      return await customerService.login(credentials);
    } else {
      throw { message: 'Invalid role' };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check user role
  getUserRole: () => {
    const user = this.getCurrentUser();
    if (user && user.roles && user.roles.length > 0) {
      return user.roles[0]; // Assumes first role is the primary one
    }
    return null;
  },
};

export default authService;
