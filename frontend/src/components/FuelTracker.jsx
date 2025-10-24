import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';

const FuelTracker = ({ car, onClose }) => {
    const [fuelEntries, setFuelEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        fuelAmount: '',
        cost: '',
        mileage: '',
        fuelType: 'gasoline',
        notes: ''
    });

    useEffect(() => {
        if (car) {
            fetchFuelEntries();
        }
    }, [car]);

    const fetchFuelEntries = async () => {
        try {
            const response = await api.get(`/api/cars/${car._id}/fuel-entries`);
            setFuelEntries(response.data.data);
        } catch (error) {
            console.error('Error fetching fuel entries:', error);
            setFuelEntries([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/api/cars/${car._id}/fuel-entries`, {
                ...formData,
                fuelAmount: parseFloat(formData.fuelAmount),
                cost: parseFloat(formData.cost),
                mileage: parseInt(formData.mileage)
            });

            toast.success('Fuel entry added successfully!');
            setShowForm(false);
            setFormData({
                date: new Date().toISOString().split('T')[0],
                fuelAmount: '',
                cost: '',
                mileage: '',
                fuelType: 'gasoline',
                notes: ''
            });
            fetchFuelEntries();
        } catch (error) {
            toast.error('Failed to add fuel entry');
            console.error('Error adding fuel entry:', error);
        }
    };

    const calculateEfficiency = (entries) => {
        if (entries.length < 2) return null;

        const sortedEntries = entries.sort((a, b) => new Date(a.date) - new Date(b.date));
        let totalFuel = 0;
        let totalDistance = 0;

        for (let i = 1; i < sortedEntries.length; i++) {
            const prevEntry = sortedEntries[i - 1];
            const currentEntry = sortedEntries[i];

            const distance = currentEntry.mileage - prevEntry.mileage;
            if (distance > 0) {
                totalDistance += distance;
                totalFuel += currentEntry.fuelAmount;
            }
        }

        return totalDistance > 0 ? (totalDistance / totalFuel).toFixed(2) : null;
    };

    const calculateTotalCost = (entries) => {
        return entries.reduce((sum, entry) => sum + (entry.cost || 0), 0);
    };

    const calculateAverageCostPerMile = (entries) => {
        const totalCost = calculateTotalCost(entries);
        const totalMiles = entries.length > 0 ?
            Math.max(...entries.map(e => e.mileage)) - Math.min(...entries.map(e => e.mileage)) : 0;
        return totalMiles > 0 ? (totalCost / totalMiles).toFixed(2) : 0;
    };

    const getEfficiencyColor = (efficiency) => {
        if (!efficiency) return 'text-gray-600';
        const eff = parseFloat(efficiency);
        if (eff >= 30) return 'text-green-600';
        if (eff >= 20) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl p-8">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            </div>
        );
    }

    const efficiency = calculateEfficiency(fuelEntries);
    const totalCost = calculateTotalCost(fuelEntries);
    const avgCostPerMile = calculateAverageCostPerMile(fuelEntries);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-6xl w-full mx-4 my-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">
                        Fuel Efficiency Tracker - {car?.brand} {car?.model}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-3xl"
                    >
                        ×
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-blue-50 rounded-lg p-6">
                        <div className="text-2xl font-bold text-blue-600">
                            {efficiency ? `${efficiency} MPG` : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Fuel Efficiency</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6">
                        <div className="text-2xl font-bold text-green-600">
                            ${totalCost.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">Total Fuel Cost</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-6">
                        <div className="text-2xl font-bold text-purple-600">
                            ${avgCostPerMile}
                        </div>
                        <div className="text-sm text-gray-600">Cost per Mile</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-6">
                        <div className="text-2xl font-bold text-orange-600">
                            {fuelEntries.length}
                        </div>
                        <div className="text-sm text-gray-600">Fuel Entries</div>
                    </div>
                </div>

                {/* Add Entry Button */}
                <div className="mb-8">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                    >
                        {showForm ? 'Cancel' : '+ Add Fuel Entry'}
                    </button>
                </div>

                {/* Add Entry Form */}
                {showForm && (
                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Add Fuel Entry</h3>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Amount (Gallons)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.fuelAmount}
                                    onChange={(e) => setFormData({ ...formData, fuelAmount: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cost ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.cost}
                                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Mileage</label>
                                <input
                                    type="number"
                                    value={formData.mileage}
                                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                                <select
                                    value={formData.fuelType}
                                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="gasoline">Gasoline</option>
                                    <option value="diesel">Diesel</option>
                                    <option value="electric">Electric</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Optional notes about this fuel entry..."
                                />
                            </div>
                            <div className="md:col-span-2 flex space-x-4">
                                <button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
                                >
                                    Add Entry
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Fuel Entries Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800">Fuel Entries History</h3>
                    </div>

                    {fuelEntries.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-4">⛽</div>
                            <p className="text-gray-600">No fuel entries found</p>
                            <p className="text-sm text-gray-500">Add your first fuel entry to start tracking efficiency</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fuel Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cost
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mileage
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Notes
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {fuelEntries.map((entry, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(entry.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {entry.fuelAmount} gal
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ${entry.cost?.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {entry.mileage?.toLocaleString()} miles
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className="capitalize">{entry.fuelType}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {entry.notes || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FuelTracker;
