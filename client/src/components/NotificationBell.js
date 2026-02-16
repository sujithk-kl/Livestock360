import React, { useState, useEffect, useRef } from 'react';
import notificationService from '../services/notificationService';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            if (data.success) {
                setNotifications(data.data);
                setUnreadCount(data.data.filter(n => !n.isRead).length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkRead = async (id, productId) => {
        try {
            await notificationService.markRead(id);
            fetchNotifications(); // Refresh
            if (productId) {
                navigate('/farmer/products'); // Redirect to products
            }
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    const handleDelete = async (id, event) => {
        event.stopPropagation(); // Prevent marking as read when deleting
        try {
            await notificationService.deleteNotification(id);
            fetchNotifications(); // Refresh
        } catch (error) {
            console.error('Failed to delete notification', error);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 focus:outline-none"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-20 border border-gray-200 dark:border-gray-700">
                    <div className="py-2">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No notifications</div>
                        ) : (
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.map(notification => (
                                    <div
                                        key={notification._id}
                                        className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 ${!notification.isRead ? 'bg-green-50 dark:bg-gray-700' : ''}`}
                                    >
                                        <div onClick={() => handleMarkRead(notification._id, notification.product)} className="cursor-pointer">
                                            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{notification.message}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            {!notification.isRead && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkRead(notification._id);
                                                    }}
                                                    className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                                >
                                                    Mark as Done
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => handleDelete(notification._id, e)}
                                                className="text-xs px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
