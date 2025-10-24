import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';

const CarComparison = ({ onClose }) => {
    const [cars, setCars] = useState([]);
    const [selectedCars, setSelectedCars] = useState([null, null]);
    const [loading, setLoading] = useState(true);
    const [car1Services, setCar1Services] = useState([]);
    const [car2Services, setCar2Services] = useState([]);

    useEffect(() => {
        fetchCars();
    }, []);

    useEffect(() => {
        if (selectedCars[0]) {
            fetchServices(selectedCars[0]._id, setCar1Services);
        }
        if (selectedCars[1]) {
            fetchServices(selectedCars[1]._id, setCar2Services);
        }
    }, [selectedCars]);

    const fetchCars = async () => {
        try {
            const response = await api.get('/api/cars');
            setCars(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch cars');
            console.error('Error fetching cars:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async (carId, setServices) => {
        try {
            const response = await api.get(`/api/services/${carId}`);
            setServices(response.data.data);
        } catch (error) {
            console.error('Error fetching services:', error);
            setServices([]);
        }
    };

    const handleCarSelect = (carIndex, car) => {
        const newSelectedCars = [...selectedCars];
        newSelectedCars[carIndex] = car;
        setSelectedCars(newSelectedCars);
    };

    const clearSelection = (carIndex) => {
        const newSelectedCars = [...selectedCars];
        newSelectedCars[carIndex] = null;
        setSelectedCars(newSelectedCars);
    };

    const getComparisonValue = (car, field) => {
        if (!car) return 'N/A';
        return car[field] || 'N/A';
    };

    const getComparisonScore = (car1, car2, field) => {
        if (!car1 || !car2) return 'neutral';

        const value1 = car1[field];
        const value2 = car2[field];

        if (field === 'price' || field === 'mileage') {
            return value1 < value2 ? 'better' : value1 > value2 ? 'worse' : 'equal';
        } else if (field === 'year') {
            return value1 > value2 ? 'better' : value1 < value2 ? 'worse' : 'equal';
        }

        return 'neutral';
    };

    const getScoreColor = (score) => {
        switch (score) {
            case 'better': return 'text-green-600 bg-green-100';
            case 'worse': return 'text-red-600 bg-red-100';
            case 'equal': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getScoreIcon = (score) => {
        switch (score) {
            case 'better': return '🟢';
            case 'worse': return '🔴';
            case 'equal': return '🔵';
            default: return '⚪';
        }
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-7xl w-full mx-4 my-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Car Comparison Tool</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-3xl"
                    >
                        ×
                    </button>
                </div>

                {/* Car Selection */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Car 1 Selection */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Select First Car</h3>
                        {selectedCars[0] ? (
                            <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-lg font-semibold">{selectedCars[0].brand} {selectedCars[0].model}</h4>
                                        <p className="text-gray-600">{selectedCars[0].year}</p>
                                    </div>
                                    <button
                                        onClick={() => clearSelection(0)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        ✕
                                    </button>
                                </div>
                                {selectedCars[0].image && (
                                    <img
                                        src={selectedCars[0].image}
                                        alt={selectedCars[0].brand}
                                        className="w-full h-32 object-cover rounded-lg mb-4"
                                    />
                                )}
                            </div>
                        ) : (
                            <select
                                onChange={(e) => {
                                    const car = cars.find(c => c._id === e.target.value);
                                    handleCarSelect(0, car);
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Choose a car...</option>
                                {cars.map(car => (
                                    <option key={car._id} value={car._id}>
                                        {car.brand} {car.model} ({car.year})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Car 2 Selection */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Second Car</h3>
                        {selectedCars[1] ? (
                            <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-lg font-semibold">{selectedCars[1].brand} {selectedCars[1].model}</h4>
                                        <p className="text-gray-600">{selectedCars[1].year}</p>
                                    </div>
                                    <button
                                        onClick={() => clearSelection(1)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        ✕
                                    </button>
                                </div>
                                {selectedCars[1].image && (
                                    <img
                                        src={selectedCars[1].image}
                                        alt={selectedCars[1].brand}
                                        className="w-full h-32 object-cover rounded-lg mb-4"
                                    />
                                )}
                            </div>
                        ) : (
                            <select
                                onChange={(e) => {
                                    const car = cars.find(c => c._id === e.target.value);
                                    handleCarSelect(1, car);
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Choose a car...</option>
                                {cars.map(car => (
                                    <option key={car._id} value={car._id}>
                                        {car.brand} {car.model} ({car.year})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {/* Comparison Table */}
                {selectedCars[0] && selectedCars[1] && (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-800">Detailed Comparison</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Feature
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Car 1
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Car 2
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Winner
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {[
                                        { field: 'brand', label: 'Brand' },
                                        { field: 'model', label: 'Model' },
                                        { field: 'year', label: 'Year' },
                                        { field: 'price', label: 'Price', format: (value) => value ? `$${value.toLocaleString()}` : 'N/A' },
                                        { field: 'color', label: 'Color' },
                                        { field: 'mileage', label: 'Mileage', format: (value) => value ? `${value.toLocaleString()} miles` : 'N/A' },
                                        { field: 'description', label: 'Description' }
                                    ].map(({ field, label, format }) => {
                                        const value1 = getComparisonValue(selectedCars[0], field);
                                        const value2 = getComparisonValue(selectedCars[1], field);
                                        const score = getComparisonScore(selectedCars[0], selectedCars[1], field);

                                        return (
                                            <tr key={field}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {label}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {format ? format(value1) : value1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {format ? format(value2) : value2}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(score)}`}>
                                                        {getScoreIcon(score)} {score}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Service History Comparison */}
                {selectedCars[0] && selectedCars[1] && (
                    <div className="mt-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-800">Service History Comparison</h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                    {selectedCars[0].brand} {selectedCars[0].model}
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Services:</span>
                                        <span className="font-semibold">{car1Services.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Cost:</span>
                                        <span className="font-semibold">
                                            ${car1Services.reduce((sum, service) => sum + (service.cost || 0), 0).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Average Cost:</span>
                                        <span className="font-semibold">
                                            ${car1Services.length > 0 ? (car1Services.reduce((sum, service) => sum + (service.cost || 0), 0) / car1Services.length).toFixed(2) : '0.00'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                    {selectedCars[1].brand} {selectedCars[1].model}
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Services:</span>
                                        <span className="font-semibold">{car2Services.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Cost:</span>
                                        <span className="font-semibold">
                                            ${car2Services.reduce((sum, service) => sum + (service.cost || 0), 0).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Average Cost:</span>
                                        <span className="font-semibold">
                                            ${car2Services.length > 0 ? (car2Services.reduce((sum, service) => sum + (service.cost || 0), 0) / car2Services.length).toFixed(2) : '0.00'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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

export default CarComparison;
