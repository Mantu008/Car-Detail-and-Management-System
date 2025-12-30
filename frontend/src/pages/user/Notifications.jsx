import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/notificationContext';
import api from '../../config/api';

const Notifications = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const { markAllAsRead } = useNotifications();

    useEffect(() => {
        fetchAnnouncements();
        // Mark all notifications as read when page is viewed
        markAllAsRead();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await api.get('/api/announcements');
            setAnnouncements(response.data.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch announcements');
        } finally {
            setLoading(false);
        }
    };

    const getTypeStyles = (type) => {
        switch (type) {
            case 'warning': return 'bg-yellow-50 border-yellow-300 text-yellow-900';
            case 'error': return 'bg-red-50 border-red-300 text-red-900';
            case 'success': return 'bg-green-50 border-green-300 text-green-900';
            default: return 'bg-blue-50 border-blue-300 text-blue-900';
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'warning': return '⚠️';
            case 'error': return '🚨';
            case 'success': return '✅';
            default: return '📢';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 sm:py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                        🔔 Notifications & Announcements
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600">
                        Stay updated with the latest announcements and system notifications
                    </p>
                </div>

                <div className="space-y-4">
                    {announcements.length === 0 ? (
                        <div className="text-center py-16 sm:py-20 bg-white rounded-2xl shadow-lg border-2 border-gray-100">
                            <div className="text-5xl sm:text-6xl mb-4">🔕</div>
                            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">No Notifications</h3>
                            <p className="text-sm sm:text-base text-gray-600">You're all caught up! No new announcements.</p>
                        </div>
                    ) : (
                        announcements.map((announcement) => (
                            <div
                                key={announcement._id}
                                className={`p-4 sm:p-6 rounded-2xl border-2 shadow-md hover:shadow-lg transition-all duration-200 ${getTypeStyles(announcement.type)}`}
                            >
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <span className="text-2xl sm:text-3xl flex-shrink-0">{getIcon(announcement.type)}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                            <h3 className="font-bold text-base sm:text-lg">{announcement.title}</h3>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase ${announcement.type === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                                                    announcement.type === 'error' ? 'bg-red-200 text-red-800' :
                                                        announcement.type === 'success' ? 'bg-green-200 text-green-800' :
                                                            'bg-blue-200 text-blue-800'
                                                }`}>
                                                {announcement.type}
                                            </span>
                                        </div>
                                        <p className="text-sm sm:text-base opacity-90 mb-2">{announcement.message}</p>
                                        <div className="flex items-center gap-4 text-xs opacity-75">
                                            <span>📅 {new Date(announcement.createdAt).toLocaleDateString()}</span>
                                            <span>🕐 {new Date(announcement.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {announcements.length > 0 && (
                    <div className="mt-6 text-center text-sm text-gray-600">
                        Showing {announcements.length} notification{announcements.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
