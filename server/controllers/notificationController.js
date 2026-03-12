const Notification = require('../models/Notification');

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
