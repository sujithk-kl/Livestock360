import api from './api';

const productService = {
    // Get all products (Public/Customer)
    getAll: async (filters = {}) => {
        try {
            const params = {};
            if (filters.category) params.category = filters.category;
            // Add other filters as needed

            const response = await api.get('/products', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch products' };
        }
    },

    // Get single product by ID
    getById: async (id) => {
        try {
            const response = await api.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch product' };
        }
    },

    // Get logged-in farmer's products
    getMyProducts: async () => {
        try {
            const response = await api.get('/products/farmer/me');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch your products' };
        }
    },

    // Create new product
    create: async (data) => {
        try {
            const response = await api.post('/products', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create product' };
        }
    },

    // Update existing product
    update: async (id, data) => {
        try {
            const response = await api.put(`/products/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update product' };
        }
    },

    // Delete product
    delete: async (id) => {
        try {
            const response = await api.delete(`/products/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete product' };
        }
    }
};

export default productService;
