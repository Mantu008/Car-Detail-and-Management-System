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
        if (action.includes('DELETE')) return 'text-red-600 bg-red-50';
        if (action.includes('CREATE')) return 'text-green-600 bg-green-50';
        if (action.includes('UPDATE')) return 'text-blue-600 bg-blue-50';
        if (action.includes('BLOCK')) return 'text-orange-600 bg-orange-50';
        return 'text-gray-600 bg-gray-50';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">System Audit Logs</h2>
                <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performed By</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Loading logs...</td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No logs found</td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {log.user?.name || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                        {log.performedBy}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <pre className="text-xs bg-gray-50 p-2 rounded max-w-xs overflow-x-auto">
                                            {JSON.stringify(log.meta, null, 2)}
                                        </pre>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogs;
