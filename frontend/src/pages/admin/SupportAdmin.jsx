import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../config/api';

const SupportAdmin = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [response, setResponse] = useState('');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await api.get('/api/admin/support');
            setTickets(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/api/admin/support/${selectedTicket._id}`, {
                status: 'resolved',
                adminResponse: response
            });
            toast.success('Ticket resolved successfully');
            setSelectedTicket(null);
            setResponse('');
            fetchTickets();
        } catch (error) {
            toast.error('Failed to resolve ticket');
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-green-600 bg-green-50';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved': return 'text-green-600 bg-green-50';
            case 'closed': return 'text-gray-600 bg-gray-50';
            default: return 'text-blue-600 bg-blue-50';
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ticket List */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Support Tickets</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {tickets.map((ticket) => (
                        <div
                            key={ticket._id}
                            onClick={() => setSelectedTicket(ticket)}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedTicket?._id === ticket._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                                    {ticket.priority}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="font-medium text-gray-900 truncate">{ticket.subject}</h3>
                            <p className="text-sm text-gray-500 truncate">{ticket.user?.name}</p>
                            <div className="mt-2">
                                <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                                    {ticket.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ticket Detail */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-140px)] flex flex-col">
                {selectedTicket ? (
                    <>
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTicket.subject}</h2>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <span>From: {selectedTicket.user?.name} ({selectedTicket.user?.email})</span>
                                        <span>•</span>
                                        <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTicket.status)}`}>
                                    {selectedTicket.status}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <p className="text-gray-800 whitespace-pre-wrap">{selectedTicket.message}</p>
                            </div>

                            {selectedTicket.adminResponse && (
                                <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
                                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Admin Response</h4>
                                    <p className="text-blue-900 whitespace-pre-wrap">{selectedTicket.adminResponse}</p>
                                    <p className="text-xs text-blue-600 mt-2">
                                        Resolved at: {new Date(selectedTicket.resolvedAt).toLocaleString()}
                                    </p>
                                </div>
                            )}

                            {selectedTicket.status === 'open' && (
                                <form onSubmit={handleResolve} className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reply & Resolve
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows="4"
                                        placeholder="Type your response here..."
                                        value={response}
                                        onChange={(e) => setResponse(e.target.value)}
                                        required
                                    ></textarea>
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                        >
                                            Send Response & Resolve
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select a ticket to view details
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportAdmin;
