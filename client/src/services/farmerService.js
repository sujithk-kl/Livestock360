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

  // Register a new farmer with retry logic
  registerFarmer: async (farmerData, maxRetries = 2) => {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await api.post('/farmers/register', farmerData);

        // Store token and user data for auto-login
        if (response.data.data && response.data.data.user && response.data.data.user.token) {
          localStorage.setItem('token', response.data.data.user.token);
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }

        return response.data;
      } catch (error) {
        console.error(`Registration attempt ${attempt + 1} failed:`, error);
        lastError = error;

        // Don't retry for client errors (4xx)
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          break;
        }

        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
        console.log(`Retrying registration in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Handle different error types after all retries
    if (lastError.response) {
      // Server responded with error status
      const status = lastError.response.status;
      const errorData = lastError.response.data;

      if (status === 400) {
        // Validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          throw {
            message: 'Validation failed',
            errors: errorData.errors
          };
        }
        throw { message: errorData.message || 'Invalid registration data' };
      } else if (status === 409) {
        // Conflict (duplicate email/aadhar)
        throw { message: errorData.message || 'Account already exists' };
      } else if (status >= 500) {
        // Server error
        throw { message: 'Server error. Please try again later.' };
      }
    } else if (lastError.request) {
      // Network error
      throw { message: 'Network error. Please check your connection and try again.' };
    } else {
      // Other error
      throw { message: 'Registration failed. Please try again.' };
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

  // ============= LIVESTOCK MANAGEMENT =============

  // Create livestock entry
  createLivestock: async (livestockData) => {
    try {
      const response = await api.post('/livestock', livestockData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create livestock entry' };
    }
  },

  // Get all livestock for current farmer
  getLivestockList: async () => {
    try {
      const response = await api.get('/livestock');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch livestock list' };
    }
  },

  // Get single livestock by ID
  getLivestockById: async (id) => {
    try {
      const response = await api.get(`/livestock/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch livestock details' };
    }
  },

  // Update livestock entry
  updateLivestock: async (id, updateData) => {
    try {
      const response = await api.put(`/livestock/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update livestock entry' };
    }
  },

  // Delete livestock entry
  deleteLivestock: async (id) => {
    try {
      const response = await api.delete(`/livestock/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete livestock entry' };
    }
  },

  // ============= STAFF MANAGEMENT =============

  // Create staff member
  createStaff: async (staffData) => {
    try {
      const response = await api.post('/staff', staffData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create staff member' };
    }
  },

  // Get staff list
  getStaffList: async () => {
    try {
      const response = await api.get('/staff');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch staff list' };
    }
  },

  // Get staff by ID
  getStaffById: async (id) => {
    try {
      const response = await api.get(`/staff/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch staff details' };
    }
  },

  // Update staff member
  updateStaff: async (id, staffData) => {
    try {
      const response = await api.put(`/staff/${id}`, staffData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update staff member' };
    }
  },

  // Delete staff member
  deleteStaff: async (id) => {
    try {
      const response = await api.delete(`/staff/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete staff member' };
    }
  },

  // Add attendance
  addAttendance: async (id, attendanceData) => {
    try {
      const response = await api.post(`/staff/${id}/attendance`, attendanceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add attendance' };
    }
  },

  // Get dashboard stats
  changePassword: async (passwordData) => {
    const response = await api.put('/farmers/password', passwordData);
    return response.data;
  },

  getDashboardStats: async () => {
    try {
      const response = await api.get('/staff/stats/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch dashboard stats' };
    }
  },
  // Forgot Password
  forgotPassword: async (email) => {
    const response = await api.post('/farmers/forgotpassword', { email });
    return response.data;
  },

  // Reset Password
  resetPassword: async (token, password) => {
    const response = await api.put(`/farmers/resetpassword/${token}`, { password });
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
      }
    }
    return response.data;
  },
};

export default farmerService;
