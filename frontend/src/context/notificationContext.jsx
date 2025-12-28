import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../config/api';
import { useAuth } from './authContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [announcements, setAnnouncements] = useState([]);
    const [socket, setSocket] = useState(null);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated && user) {
            // Initialize socket connection
            const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
            setSocket(newSocket);

            // Join user's personal room
            newSocket.emit('joinUserRoom', user._id);

            // Join admin room if user is admin
            if (user.role === 'admin') {
                newSocket.emit('joinAdminRoom');
            }

            // Listen for new announcements
            newSocket.on('newAnnouncement', (announcement) => {
                console.log('New announcement received:', announcement);

                // Add to announcements list
                setAnnouncements(prev => [announcement, ...prev]);

                // Increment unread count
                setUnreadCount(prev => prev + 1);

                // Show browser notification if supported
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(`New ${announcement.type} announcement`, {
                        body: announcement.message,
                        icon: '/favicon.ico'
                    });
                }
            });

            // Listen for notifications
            newSocket.on('notification', (notification) => {
                console.log('Notification received:', notification);
                setUnreadCount(prev => prev + 1);

                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(notification.title || 'New Notification', {
                        body: notification.message,
                        icon: '/favicon.ico'
                    });
                }
            });

            // Request notification permission
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }

            return () => {
                newSocket.close();
            };
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        // Only fetch if authenticated
        if (isAuthenticated) {
            fetchNotifications();
        }
    }, [isAuthenticated]); // Only run when authentication status changes

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/api/announcements');
            const announcementsData = response.data.data || [];
            setAnnouncements(announcementsData);

            // Get read announcements from localStorage
            const readAnnouncements = JSON.parse(localStorage.getItem('readAnnouncements') || '[]');

            // Calculate unread count
            const unread = announcementsData.filter(announcement =>
                !readAnnouncements.includes(announcement._id)
            ).length;

            setUnreadCount(unread);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markAsRead = (announcementId) => {
        const readAnnouncements = JSON.parse(localStorage.getItem('readAnnouncements') || '[]');

        if (!readAnnouncements.includes(announcementId)) {
            const updatedRead = [...readAnnouncements, announcementId];
            localStorage.setItem('readAnnouncements', JSON.stringify(updatedRead));

            // Update unread count
            const unread = announcements.filter(announcement =>
                !updatedRead.includes(announcement._id)
            ).length;

            setUnreadCount(unread);
        }
    };

    const markAllAsRead = () => {
        const allIds = announcements.map(a => a._id);
        localStorage.setItem('readAnnouncements', JSON.stringify(allIds));
        setUnreadCount(0);
    };

    const value = {
        unreadCount,
        announcements,
        socket,
        fetchNotifications,
        markAsRead,
        markAllAsRead
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
