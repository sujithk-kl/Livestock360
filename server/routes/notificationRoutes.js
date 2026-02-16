const express = require('express');
const router = express.Router();
const { getNotifications, markRead, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth'); // Check auth middleware path

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markRead);
router.delete('/:id', deleteNotification);

module.exports = router;
