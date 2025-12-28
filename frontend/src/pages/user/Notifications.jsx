import React, { useState, useEffect } from 'react';
import api from '../../config/api';

const Notifications = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await api.get('/api/announcements');
            setAnnouncements(response.data.data);
        } catch (error) {
            console.error('Failed to fetch announcements');
        } finally {
            setLoading(false);
        }
    };

    const getTypeStyles = (type) => {
        switch (type) {
            case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'error': return 'bg-red-50 border-red-200 text-red-800';
            case 'success': return 'bg-green-50 border-green-200 text-green-800';
            default: return 'bg-blue-50 border-blue-200 text-blue-800';
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

    if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Notifications & Announcements</h1>

            <div className="space-y-4">
                {announcements.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <p className="text-gray-500">No new announcements.</p>
                    </div>
                ) : (
                    announcements.map((announcement) => (
                        <div
                            key={announcement._id}
                            className={`p-6 rounded-xl border ${getTypeStyles(announcement.type)}`}
                        >
                            <div className="flex items-start">
                                <span className="text-2xl mr-4">{getIcon(announcement.type)}</span>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">{announcement.title}</h3>
                                    <p className="opacity-90">{announcement.message}</p>
                                    <p className="text-xs mt-2 opacity-75">
                                        {new Date(announcement.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
