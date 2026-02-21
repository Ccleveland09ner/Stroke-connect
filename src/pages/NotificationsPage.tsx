import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, Clock, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { useNotificationStore, Notification } from '../stores/notificationStore';
import { formatDateTime } from '../utils/formatUtils';

const NotificationsPage: React.FC = () => {
  const { 
    notifications, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    loading,
    isMutating,
    mutatingIds,
    error
  } = useNotificationStore();
  
  const [filter, setFilter] = useState<string>('all');
  
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 bg-primary-200 rounded w-32 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-2.5"></div>
          <div className="h-4 bg-gray-200 rounded w-56"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {error && (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      )}
      <div className="flex flex-wrap items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        
        {notifications.some(n => !n.read) && (
          <Button variant="outline" onClick={() => markAllAsRead()} disabled={isMutating} isLoading={isMutating}>
            Mark All as Read
          </Button>
        )}
      </div>
      
      {/* Notification filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Button 
          variant={filter === 'all' ? 'primary' : 'outline'} 
          size="sm"
          onClick={() => setFilter('all')}
          className="min-w-[80px]"
        >
          All
        </Button>
        <Button 
          variant={filter === 'unread' ? 'primary' : 'outline'} 
          size="sm"
          onClick={() => setFilter('unread')}
          className="min-w-[80px]"
        >
          Unread
        </Button>
        <Button 
          variant={filter === 'alert' ? 'error' : 'outline'} 
          size="sm"
          onClick={() => setFilter('alert')}
          className="min-w-[80px]"
        >
          Alerts
        </Button>
        <Button 
          variant={filter === 'warning' ? 'warning' : 'outline'} 
          size="sm"
          onClick={() => setFilter('warning')}
          className="min-w-[80px]"
        >
          Warnings
        </Button>
        <Button 
          variant={filter === 'info' ? 'secondary' : 'outline'} 
          size="sm"
          onClick={() => setFilter('info')}
          className="min-w-[80px]"
        >
          Info
        </Button>
      </div>
      
      {/* Notifications list */}
      <Card>
        <CardHeader className="bg-gray-50 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              {filter === 'all' ? 'All Notifications' : 
               filter === 'unread' ? 'Unread Notifications' : 
               `${filter.charAt(0).toUpperCase() + filter.slice(1)} Notifications`}
            </h3>
            <span className="text-sm text-gray-500">
              {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-0 py-0">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <Info className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No notifications</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' 
                  ? 'You have no notifications at this time.' 
                  : `You have no ${filter} notifications at this time.`}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredNotifications.map(notification => (
                <NotificationItem 
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => markAsRead(notification.id)}
                  isMarking={mutatingIds.includes(notification.id)}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: () => void;
  isMarking?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead, isMarking = false }) => {
  const { id, type, message, patientName, timestamp, read } = notification;
  
  const getIcon = () => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="h-6 w-6 text-error-500" />;
      case 'warning':
        return <Clock className="h-6 w-6 text-warning-500" />;
      case 'info':
        return <Info className="h-6 w-6 text-primary-500" />;
      default:
        return <Info className="h-6 w-6 text-gray-400" />;
    }
  };
  
  const getBgColor = () => {
    if (read) return '';
    
    switch (type) {
      case 'alert':
        return 'bg-error-50';
      case 'warning':
        return 'bg-warning-50';
      case 'info':
        return 'bg-primary-50';
      default:
        return 'bg-gray-50';
    }
  };
  
  return (
    <li className={`px-4 py-4 sm:px-6 ${getBgColor()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-sm font-medium ${read ? 'text-gray-800' : 'text-gray-900'}`}>
                {message}
              </p>
              {patientName && (
                <p className="mt-1 text-sm text-gray-500">
                  Patient: {patientName}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formatDateTime(timestamp)}
              </p>
            </div>
            {!read && (
              <button
                onClick={onMarkAsRead}
                disabled={isMarking}
                className="ml-4 bg-white rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Mark as read</span>
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

export default NotificationsPage;