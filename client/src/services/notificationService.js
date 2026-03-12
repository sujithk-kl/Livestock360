import api from './api';

// Convert base64 VAPID public key to Uint8Array (required by browser PushManager)
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

const notificationService = {
    // ─── In-app Notifications ───────────────────────────────────────────────
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
    },

    // ─── Web Push Subscriptions ─────────────────────────────────────────────
    /**
     * Request notification permission and subscribe the browser to push.
     * Sends the subscription to the backend for storage.
     * Call this after a successful login.
     */
    subscribeToPush: async () => {
        try {
            // Check browser support
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                console.warn('[Push] Push notifications not supported in this browser.');
                return false;
            }

            // Request permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.warn('[Push] Notification permission denied.');
                return false;
            }

            // Get VAPID public key from backend
            const { data } = await api.get('/push/vapid-public-key');
            const applicationServerKey = urlBase64ToUint8Array(data.publicKey);

            // Wait for service worker to be ready
            const registration = await navigator.serviceWorker.ready;

            // Subscribe to push
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey,
            });

            // Send subscription to backend
            await api.post('/push/subscribe', { subscription: subscription.toJSON() });
            console.log('[Push] Successfully subscribed to push notifications.');
            return true;
        } catch (err) {
            console.error('[Push] subscribeToPush error:', err);
            return false;
        }
    },

    /**
     * Unsubscribe from push notifications.
     * Call this on logout.
     */
    unsubscribeFromPush: async () => {
        try {
            if (!('serviceWorker' in navigator)) return;

            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await api.delete('/push/unsubscribe', { data: { endpoint: subscription.endpoint } });
                await subscription.unsubscribe();
                console.log('[Push] Unsubscribed from push notifications.');
            }
        } catch (err) {
            console.error('[Push] unsubscribeFromPush error:', err);
        }
    },
};

export default notificationService;
