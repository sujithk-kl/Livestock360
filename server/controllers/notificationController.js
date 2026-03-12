const Notification = require('../models/Notification');
const PushSubscription = require('../models/PushSubscription');
const webpush = require('web-push');

// @desc    Get notifications for logged-in farmer
// @route   GET /api/notifications
// @access  Private (Farmer)
exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort('-createdAt')
            .populate('product', 'productName');

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private (Farmer)
exports.markRead = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Ensure accessible only by recipient
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private (Farmer)
exports.deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Ensure accessible only by recipient
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        await notification.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Send a Web Push notification to a specific user.
 * @param {string} userId - MongoDB ObjectId of the user
 * @param {string} role - 'farmer' or 'customer'
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional extra data (e.g. { url: '/dashboard' })
 */
exports.sendPushToUser = async (userId, role, title, body, data = {}) => {
    try {
        const subs = await PushSubscription.find({ userId, userRole: role });
        if (!subs.length) return;

        const payload = JSON.stringify({ title, body, icon: '/pwa-192x192.png', ...data });

        const results = await Promise.allSettled(
            subs.map(sub => webpush.sendNotification(sub.subscription, payload))
        );

        // Remove subscriptions that are no longer valid (410 Gone)
        for (let i = 0; i < results.length; i++) {
            const r = results[i];
            if (r.status === 'rejected') {
                const statusCode = r.reason?.statusCode;
                if (statusCode === 410 || statusCode === 404) {
                    await PushSubscription.deleteOne({ _id: subs[i]._id });
                    console.log(`[Push] Removed expired subscription for user ${userId}`);
                } else {
                    console.error(`[Push] Failed to send to user ${userId}:`, r.reason?.message);
                }
            }
        }
    } catch (err) {
        console.error('[Push] sendPushToUser error:', err.message);
    }
};
