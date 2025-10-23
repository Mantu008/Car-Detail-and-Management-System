import React, { useState, useEffect } from 'react';
import ActivityLogger from '../../services/activityLogger';
import { toast } from 'react-toastify';

const ActivityLogs = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: '',
        entityType: '',
        dateFrom: '',
        dateTo: ''
    });
    const [stats, setStats] = useState({});

    useEffect(() => {
        fetchActivities();
        fetchStats();
    }, [filters]);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const data = await ActivityLogger.getActivities(filters);
            setActivities(data);
        } catch (error) {
            toast.error('Failed to fetch activity logs');
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await ActivityLogger.getActivityStats();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            action: '',
            entityType: '',
            dateFrom: '',
            dateTo: ''
        });
    };

    const exportLogs = () => {
        const csvContent = [
            ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'Details', 'User Agent', 'URL'],
            ...activities.map(activity => [
                new Date(activity.timestamp).toLocaleString(),
                activity.action,
                activity.entityType,
                activity.entityId || 'N/A',
                JSON.stringify(activity.details),
                activity.userAgent,
                activity.url
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'activity-logs.csv';
        link.click();
        URL.revokeObjectURL(url);

        toast.success('Activity logs exported successfully!');
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'create': return '➕';
            case 'update': return '✏️';
            case 'delete': return '🗑️';
            case 'view': return '👁️';
            case 'login': return '🔐';
            case 'logout': return '🚪';
            case 'generate_report': return '📊';
            default: return '📝';
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'create': return 'text-green-600';
            case 'update': return 'text-blue-600';
            case 'delete': return 'text-red-600';
            case 'view': return 'text-gray-600';
            case 'login': return 'text-purple-600';
            case 'logout': return 'text-orange-600';
            case 'generate_report': return 'text-indigo-600';
            default: return 'text-gray-600';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Activity Logs</h1>
                        <div className="flex space-x-4">
                            <button
                                onClick={exportLogs}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                📊 Export CSV
                            </button>
                            <button
                                onClick={fetchActivities}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                🔄 Refresh
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-blue-50 rounded-lg p-6">
                            <div className="text-2xl font-bold text-blue-600">{stats.totalActivities || 0}</div>
                            <div className="text-sm text-gray-600">Total Activities</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-6">
                            <div className="text-2xl font-bold text-green-600">{stats.todayActivities || 0}</div>
                            <div className="text-sm text-gray-600">Today's Activities</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-6">
                            <div className="text-2xl font-bold text-purple-600">{stats.topActions?.length || 0}</div>
                            <div className="text-sm text-gray-600">Action Types</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-6">
                            <div className="text-2xl font-bold text-orange-600">{stats.topUsers?.length || 0}</div>
                            <div className="text-sm text-gray-600">Active Users</div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                                <select
                                    value={filters.action}
                                    onChange={(e) => handleFilterChange('action', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Actions</option>
                                    <option value="create">Create</option>
                                    <option value="update">Update</option>
                                    <option value="delete">Delete</option>
                                    <option value="view">View</option>
                                    <option value="login">Login</option>
                                    <option value="logout">Logout</option>
                                    <option value="generate_report">Generate Report</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
                                <select
                                    value={filters.entityType}
                                    onChange={(e) => handleFilterChange('entityType', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Types</option>
                                    <option value="car">Car</option>
                                    <option value="service">Service</option>
                                    <option value="user">User</option>
                                    <option value="report">Report</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                                <input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={clearFilters}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Activity Logs Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Timestamp
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Entity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {activities.map((activity, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(activity.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(activity.action)}`}>
                                                {getActionIcon(activity.action)} {activity.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>
                                                <div className="font-medium">{activity.entityType}</div>
                                                {activity.entityId && (
                                                    <div className="text-gray-500">ID: {activity.entityId}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="max-w-xs truncate">
                                                {JSON.stringify(activity.details)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activity.offline ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {activity.offline ? 'Offline' : 'Online'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {activities.length === 0 && (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-4">📝</div>
                            <p className="text-gray-600">No activity logs found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityLogs;
