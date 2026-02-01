import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Notification } from '../types';

interface NotificationCenterProps {
  notifications?: Notification[];
  onMarkAsRead?: (notificationId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications = [],
  onMarkAsRead
}) => {
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const handleMarkAsRead = (notificationId: string) => {
    onMarkAsRead?.(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'verification_required':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'approved':
        return 'border-l-4 border-l-green-500 bg-green-50';
      case 'rejected':
        return 'border-l-4 border-l-red-500 bg-red-50';
      case 'verification_required':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-4 border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {showPanel && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="sticky top-0 bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            <button
              onClick={() => setShowPanel(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {notifications.map(notification => (
                <div
                  key={notification.notification_id}
                  className={`p-4 ${getNotificationColor(notification.type)} cursor-pointer hover:opacity-80 transition ${
                    !notification.read ? 'font-semibold' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notification.notification_id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{notification.title}</h4>
                      <p className="text-gray-700 text-sm mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.property_title}</p>
                      {notification.action_notes && (
                        <p className="text-xs text-gray-600 mt-2 italic">{notification.action_notes}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.created_at).toLocaleDateString()} at{' '}
                        {new Date(notification.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-1.5" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No notifications yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
