import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../config/api';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterAction, setFilterAction] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [filterAction]);

    const fetchLogs = async () => {
        try {
            const params = {};
            if (filterAction) params.action = filterAction;

            const response = await api.get('/api/admin/logs', { params });
            setLogs(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch audit logs');
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action) => {
        if (action.includes('DELETE')) return 'text-red-700 bg-red-100 border-red-200';
        if (action.includes('CREATE')) return 'text-green-700 bg-green-100 border-green-200';
        if (action.includes('UPDATE')) return 'text-blue-700 bg-blue-100 border-blue-200';
        if (action.includes('BLOCK')) return 'text-orange-700 bg-orange-100 border-orange-200';
        return 'text-gray-700 bg-gray-100 border-gray-200';
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">System Audit Logs</h2>
                        <select
                            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all touch-target"
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                        >
                            <option value="">All Actions</option>
                            <option value="LOGIN">Login</option>
                            <option value="CREATE_VEHICLE">Create Vehicle</option>
                            <option value="DELETE_VEHICLE">Delete Vehicle</option>
                            <option value="BLOCK_USER">Block User</option>
                        </select>
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Performed By</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No logs found</td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full border ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {log.user?.name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                                            {log.performedBy}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <pre className="text-xs bg-gray-50 p-2 rounded-lg max-w-xs overflow-x-auto border border-gray-200">
                                                {JSON.stringify(log.meta, null, 2)}
                                            </pre>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden p-4 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No logs found
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log._id} className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-2xl p-4 shadow-md">
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getActionColor(log.action)}`}>
                                        {log.action}
                                    </span>
                                    <div className="text-xs text-gray-500">
                                        {new Date(log.timestamp).toLocaleString([], {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">User:</span>
                                        <span className="font-semibold text-gray-900">{log.user?.name || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Performed By:</span>
                                        <span className="font-medium text-gray-700 capitalize">{log.performedBy}</span>
                                    </div>
                                </div>
                                {log.meta && Object.keys(log.meta).length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <div className="text-xs text-gray-600 mb-1">Details:</div>
                                        <pre className="text-xs bg-gray-100 p-2 rounded-lg overflow-x-auto border border-gray-200">
                                            {JSON.stringify(log.meta, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Results Count */}
            {!loading && logs.length > 0 && (
                <div className="text-center text-sm text-gray-600">
                    Showing {logs.length} log{logs.length !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
