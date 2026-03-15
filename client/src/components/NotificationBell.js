import React, { useState, useEffect, useRef } from 'react';
import notificationService from '../services/notificationService';
import { useNavigate } from 'react-router-dom';

const ORDER_TYPES = ['NEW_ORDER'];
const ALERT_TYPES = ['OOS', 'SUB_NEW', 'SUB_SKIP', 'SUB_VACATION', 'SUB_RESUME', 'SUB_CANCEL'];

const typeIcon = (type) => {
  switch (type) {
    case 'NEW_ORDER': return '📦';
    case 'SUB_NEW': return '📋';
    case 'SUB_SKIP': return '⏭️';
    case 'SUB_VACATION': return '🏖️';
    case 'SUB_RESUME': return '✅';
    case 'SUB_CANCEL': return '❌';
    case 'OOS': return '⚠️';
    default: return '🔔';
  }
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'alerts'
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
    const interval = setInterval(fetchNotifications, 60000);
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

  const handleMarkRead = async (id, type) => {
    try {
      await notificationService.markRead(id);
      fetchNotifications();
      if (type === 'OOS') navigate('/farmer/products');
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const handleDelete = async (id, event) => {
    event.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const orderNotifs = notifications.filter(n => ORDER_TYPES.includes(n.type));
  const alertNotifs = notifications.filter(n => ALERT_TYPES.includes(n.type));
  const unreadOrders = orderNotifs.filter(n => !n.isRead).length;
  const unreadAlerts = alertNotifs.filter(n => !n.isRead).length;

  const displayed = activeTab === 'orders' ? orderNotifs : alertNotifs;

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
        <div className="
          fixed left-2 right-2 mt-2 top-16
          sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:w-96 sm:fixed-none
          bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-200 dark:border-gray-700
        ">

          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'orders'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              📦 Orders
              {unreadOrders > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold bg-blue-500 text-white rounded-full">
                  {unreadOrders}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'alerts'
                  ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 bg-amber-50/50 dark:bg-amber-900/10'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              🔔 Alerts
              {unreadAlerts > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-full">
                  {unreadAlerts}
                </span>
              )}
            </button>
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {displayed.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                <div className="text-3xl mb-2">{activeTab === 'orders' ? '📭' : '🔕'}</div>
                No {activeTab === 'orders' ? 'order' : ''} notifications yet
              </div>
            ) : (
              displayed.map(notification => (
                <div
                  key={notification._id}
                  className={`px-4 py-3 border-b border-gray-50 dark:border-gray-700/60 ${
                    !notification.isRead ? 'bg-green-50 dark:bg-gray-700/60' : 'bg-white dark:bg-gray-800'
                  }`}
                >
                  <div
                    onClick={() => handleMarkRead(notification._id, notification.type)}
                    className="cursor-pointer"
                  >
                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-snug">
                      {typeIcon(notification.type)} {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {!notification.isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkRead(notification._id); }}
                        className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      >
                        Mark Done
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(notification._id, e)}
                      className="text-xs px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
