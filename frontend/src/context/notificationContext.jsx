import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import api, { API_BASE_URL, tokenStore } from '../config/api';
import { useAuth } from './authContext';

const NotificationContext = createContext(null);
const READ_KEY = 'cms_read_announcements';

const readAnnouncementIds = () => {
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) || '[]');
  } catch {
    return [];
  }
};

export const NotificationProvider = ({ children }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [readIds, setReadIds] = useState(readAnnouncementIds);

  const refresh = useCallback(async () => {
    const [n, a] = await Promise.allSettled([api.get('/api/notifications'), api.get('/api/announcements')]);
    if (n.status === 'fulfilled') setNotifications(n.value.data.data || []);
    if (a.status === 'fulfilled') setAnnouncements(a.value.data.data || []);
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setAnnouncements([]);
      return undefined;
    }

    refresh();

    const socket = io(API_BASE_URL, { auth: { token: tokenStore.get() }, transports: ['websocket', 'polling'] });

    socket.on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      toast.info(notification.title);
    });
    socket.on('announcement', (announcement) => {
      setAnnouncements((prev) => [announcement, ...prev.filter((a) => a._id !== announcement._id)]);
      toast.info(`Announcement: ${announcement.title}`);
    });
    socket.on('account:blocked', () => {
      toast.error('Your account has been blocked by an administrator.');
      logout();
    });

    return () => socket.disconnect();
  }, [user?._id, refresh, logout]); // eslint-disable-line react-hooks/exhaustive-deps

  const markNotificationRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    api.put(`/api/notifications/${id}/read`).catch(() => {});
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    const ids = announcements.map((a) => a._id);
    setReadIds(ids);
    try {
      localStorage.setItem(READ_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
    api.put('/api/notifications/read-all').catch(() => {});
  }, [announcements]);

  const unreadCount = useMemo(
    () =>
      notifications.filter((n) => !n.read).length + announcements.filter((a) => !readIds.includes(a._id)).length,
    [notifications, announcements, readIds]
  );

  const value = useMemo(
    () => ({ notifications, announcements, readIds, unreadCount, refresh, markNotificationRead, markAllRead }),
    [notifications, announcements, readIds, unreadCount, refresh, markNotificationRead, markAllRead]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
