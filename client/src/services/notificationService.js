import api from './api';

const notificationService = {
    getNotifications: async () => {
        const response = await api.get('/notifications');
        return response.data;
    },

    markRead: async (id) => {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    },

    deleteNotification: async (id) => {
        const response = await api.delete(`/notifications/${id}`);
        return response.data;
    }
};

export default notificationService;
