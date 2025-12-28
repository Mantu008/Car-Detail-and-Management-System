import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../config/api';

const Support = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        priority: 'low'
    });

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await api.get('/api/support');
            setTickets(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/support', formData);
            toast.success('Ticket created successfully');
            setShowForm(false);
            setFormData({ subject: '', message: '', priority: 'low' });
            fetchTickets();
        } catch (error) {
            toast.error('Failed to create ticket');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Support & Help</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    {showForm ? 'Cancel' : 'Create New Ticket'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                    <h2 className="text-lg font-semibold mb-4">New Support Ticket</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows="4"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                required
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
                        >
                            Submit Ticket
                        </button>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {tickets.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <p className="text-gray-500">No support tickets found.</p>
                    </div>
                ) : (
                    tickets.map((ticket) => (
                        <div key={ticket._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-lg text-gray-900">{ticket.subject}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                    {ticket.status}
                                </span>
                            </div>
                            <p className="text-gray-600 mb-4">{ticket.message}</p>

                            {ticket.adminResponse && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <p className="text-sm font-semibold text-blue-800 mb-1">Support Response:</p>
                                    <p className="text-blue-900">{ticket.adminResponse}</p>
                                </div>
                            )}

                            <div className="mt-4 text-xs text-gray-400">
                                Created: {new Date(ticket.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Support;
