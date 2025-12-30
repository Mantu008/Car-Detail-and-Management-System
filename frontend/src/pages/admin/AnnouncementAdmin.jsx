import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../config/api';

const AnnouncementAdmin = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        expiresAt: ''
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await api.get('/api/announcements');
            setAnnouncements(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch announcements');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/announcements', formData);
            toast.success('Announcement created successfully');
            setShowForm(false);
            setFormData({ title: '', message: '', type: 'info', expiresAt: '' });
            fetchAnnouncements();
        } catch (error) {
            toast.error('Failed to create announcement');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await api.delete(`/api/announcements/${id}`);
            toast.success('Announcement deleted');
            fetchAnnouncements();
        } catch (error) {
            toast.error('Failed to delete announcement');
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'error': return 'bg-red-100 text-red-800 border-red-200';
            case 'success': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Announcements</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 touch-target"
                >
                    {showForm ? '✕ Cancel' : '+ Create New'}
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 animate-slide-down">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">New Announcement</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 sm:py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all touch-target"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                <select
                                    className="w-full px-4 py-2.5 sm:py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all touch-target"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="info">Info</option>
                                    <option value="success">Success</option>
                                    <option value="warning">Warning</option>
                                    <option value="error">Error</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                            <textarea
                                className="w-full px-4 py-2.5 sm:py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all touch-target"
                                rows="4"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                required
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Expires At (Optional)</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2.5 sm:py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all touch-target"
                                value={formData.expiresAt}
                                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 touch-target"
                        >
                            📢 Publish Announcement
                        </button>
                    </form>
                </div>
            )}

            {/* Announcements List */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Message</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {announcements.map((announcement) => (
                                <tr key={announcement._id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-900">{announcement.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full border ${getTypeColor(announcement.type)}`}>
                                            {announcement.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{announcement.message}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {new Date(announcement.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => handleDelete(announcement._id)}
                                            className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {announcements.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        {loading ? 'Loading announcements...' : 'No active announcements.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No active announcements.
                        </div>
                    ) : (
                        announcements.map((announcement) => (
                            <div key={announcement._id} className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-2xl p-4 shadow-md">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-bold text-gray-900 flex-1 pr-2">{announcement.title}</h3>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border whitespace-nowrap ${getTypeColor(announcement.type)}`}>
                                        {announcement.type}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 mb-3 line-clamp-3">{announcement.message}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                    <span>Created: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(announcement._id)}
                                    className="w-full bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md touch-target"
                                >
                                    🗑️ Delete Announcement
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Results Count */}
            {!loading && announcements.length > 0 && (
                <div className="text-center text-sm text-gray-600">
                    {announcements.length} active announcement{announcements.length !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
};

export default AnnouncementAdmin;
