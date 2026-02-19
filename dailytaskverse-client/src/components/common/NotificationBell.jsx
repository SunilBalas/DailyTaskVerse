import { useState, useEffect, useRef } from 'react';
import { MdNotifications, MdDoneAll, MdCircle } from 'react-icons/md';
import { notificationApi } from '../../services/api';
import './NotificationBell.css';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await notificationApi.getUnreadCount();
      setUnreadCount(data.count);
    } catch {}
  };

  const fetchAll = async () => {
    try {
      const { data } = await notificationApi.getAll();
      setNotifications(data);
    } catch {}
  };

  const toggleOpen = () => {
    if (!open) fetchAll();
    setOpen(!open);
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="notification-bell" ref={ref}>
      <button className="bell-btn" onClick={toggleOpen}>
        <MdNotifications />
        {unreadCount > 0 && <span className="bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <span className="notification-title">Notifications</span>
            {unreadCount > 0 && (
              <button className="btn-mark-all" onClick={handleMarkAllRead}>
                <MdDoneAll /> Mark all read
              </button>
            )}
          </div>
          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notification-item ${n.isRead ? 'read' : 'unread'}`}
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                >
                  <div className="notification-dot">
                    {!n.isRead && <MdCircle />}
                  </div>
                  <div className="notification-body">
                    <span className="notification-item-title">{n.title}</span>
                    <span className="notification-message">{n.message}</span>
                    <span className="notification-time">{timeAgo(n.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="notification-empty">No notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
