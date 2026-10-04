import React, { useState } from 'react';

export interface NotificationItem {
  id: string | number;
  title: string;
  description: string;
  time: string;
  unread?: boolean;
  type?: 'breakdown' | 'conflict' | 'info' | 'alert' | 'success';
}

export interface NotificationCardProps {
  title?: string;
  markAllReadText?: string;
  notifications?: NotificationItem[];
  onMarkAllRead?: () => void;
  onNotificationClick?: (notification: NotificationItem) => void;
  className?: string;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Vehicle breakdown — R-5',
    description: 'M. Rizwan reported a breakdown near Kadawatha. 1 unserved stop (Tech Colombo Flagship).',
    time: '09:12',
    unread: true,
  },
  {
    id: '2',
    title: 'Offline conflict on R-1',
    description: 'Driver completed stop 2 offline before your reassignment. Both records kept.',
    time: '08:58',
    unread: true,
  },
];

export function NotificationCard({
  title = 'NOTIFICATIONS',
  markAllReadText = 'Mark all read',
  notifications: initialNotifications,
  onMarkAllRead,
  onNotificationClick,
  className = '',
}: NotificationCardProps) {
  const [items, setItems] = useState<NotificationItem[]>(
    initialNotifications ?? DEFAULT_NOTIFICATIONS
  );

  // Sync state whenever parent passes updated notifications
  React.useEffect(() => {
    if (initialNotifications) {
      setItems(initialNotifications);
    }
  }, [initialNotifications]);

  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
    if (onMarkAllRead) {
      onMarkAllRead();
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    setItems((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    if (onNotificationClick) {
      onNotificationClick(item);
    }
  };

  return (
    <div className={`wp-notification-card ${className}`}>
      {/* Header */}
      <div className="wp-notification-header">
        <h3 className="wp-notification-title">{title}</h3>
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="wp-notification-mark-read"
        >
          {markAllReadText}
        </button>
      </div>

      {/* Notifications List */}
      <div className="wp-notification-list">
        {items.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            No new notifications
          </div>
        ) : (
          items.map((item) => {
            const isRead = !item.unread;
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`wp-notification-item ${isRead ? 'is-read' : ''}`}
              >
                {/* Header row: Title & Time */}
                <div className="wp-notification-item-header">
                  <span className="wp-notification-item-title">
                    {item.title}
                  </span>
                  <span className="wp-notification-item-time">
                    {item.time}
                  </span>
                </div>

                {/* Message Body */}
                <p className="wp-notification-item-body">
                  {item.description}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default NotificationCard;

