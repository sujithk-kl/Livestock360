const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');
const { protect } = require('../middleware/auth');

// @desc  Get VAPID public key (no auth needed - public info)
// @route GET /api/push/vapid-public-key
router.get('/vapid-public-key', (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// @desc  Save push subscription for logged-in user
// @route POST /api/push/subscribe
router.post('/subscribe', protect, async (req, res) => {
    try {
        const { subscription } = req.body;

        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ success: false, message: 'Invalid subscription object' });
        }

        // Upsert: update if endpoint exists, insert if not
        await PushSubscription.findOneAndUpdate(
            { 'subscription.endpoint': subscription.endpoint },
            {
                userId: req.user.id,
                userRole: req.user.role,
                subscription
            },
            { upsert: true, new: true }
        );

        res.status(201).json({ success: true, message: 'Subscribed to push notifications' });
    } catch (err) {
        console.error('[Push] Subscribe error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to save subscription' });
    }
});

// @desc  Remove push subscription (call on logout)
// @route DELETE /api/push/unsubscribe
router.delete('/unsubscribe', protect, async (req, res) => {
    try {
        const { endpoint } = req.body;

        if (endpoint) {
            await PushSubscription.deleteOne({ 'subscription.endpoint': endpoint });
        } else {
            // Remove all subscriptions for this user
            await PushSubscription.deleteMany({ userId: req.user.id });
        }

        res.json({ success: true, message: 'Unsubscribed from push notifications' });
    } catch (err) {
        console.error('[Push] Unsubscribe error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to remove subscription' });
    }
});

// @desc  Test push notification (dev only)
// @route POST /api/push/test
router.post('/test', protect, async (req, res) => {
    try {
        const subs = await PushSubscription.find({ userId: req.user.id });

        if (!subs.length) {
            return res.status(404).json({ success: false, message: 'No push subscriptions found for this user. Open the app and allow notifications first.' });
        }

        const payload = JSON.stringify({
            title: '🔔 Livestock360 Test',
            body: 'Push notifications are working correctly!',
            icon: '/pwa-192x192.png',
            url: '/'
        });

        const results = await Promise.allSettled(
            subs.map(sub => webpush.sendNotification(sub.subscription, payload))
        );

        const sent = results.filter(r => r.status === 'fulfilled').length;
        res.json({ success: true, message: `Push sent to ${sent}/${subs.length} subscription(s)` });
    } catch (err) {
        console.error('[Push] Test error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
