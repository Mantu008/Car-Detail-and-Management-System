import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../config/api';

const SuspiciousActivity = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSuspiciousVehicles();
    }, []);

    const fetchSuspiciousVehicles = async () => {
        try {
            const response = await api.get('/api/admin/suspicious-vehicles');
            setVehicles(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch suspicious vehicles');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (vehicleId, newStatus) => {
        try {
            await api.put(`/api/admin/vehicles/${vehicleId}/status`, { status: newStatus });
            toast.success(`Vehicle marked as ${newStatus}`);
            fetchSuspiciousVehicles();
        } catch (error) {
            toast.error('Failed to update vehicle status');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Suspicious Activity Review</h2>
                <p className="text-gray-600">Review vehicles flagged as suspicious. You can mark them as safe or keep them flagged.</p>
            </div>

            {vehicles.length === 0 ? (
                <div className="bg-green-50 p-8 rounded-xl text-center border border-green-100">
                    <div className="text-4xl mb-4">✅</div>
                    <h3 className="text-lg font-medium text-green-800">No Suspicious Activity</h3>
                    <p className="text-green-600">All vehicles are currently marked as normal.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vehicles.map((vehicle) => (
                        <div key={vehicle._id} className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
                            <div className="p-4 bg-red-50 border-b border-red-100 flex justify-between items-center">
                                <span className="font-semibold text-red-800">Flagged Vehicle</span>
                                <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">Suspicious</span>
                            </div>
                            <div className="p-6">
                                <div className="flex items-start space-x-4">
                                    {vehicle.image && (
                                        <img
                                            src={vehicle.image}
                                            alt={vehicle.brand}
                                            className="w-24 h-24 object-cover rounded-lg"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900">{vehicle.brand} {vehicle.model}</h3>
                                        <p className="text-gray-600">{vehicle.year} • {vehicle.type}</p>
                                        <div className="mt-2 text-sm text-gray-500">
                                            <p>Owner: <span className="font-medium text-gray-900">{vehicle.owner?.name}</span></p>
                                            <p>Email: {vehicle.owner?.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex space-x-3">
                                    <button
                                        onClick={() => handleStatusChange(vehicle._id, 'normal')}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                                    >
                                        Mark as Safe
                                    </button>
                                    <button
                                        onClick={() => window.open(`/cars/${vehicle._id}`, '_blank')}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SuspiciousActivity;
