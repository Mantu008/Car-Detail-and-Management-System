import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

const CarComparison = ({ onClose, cars: propCars }) => {
    const [cars, setCars] = useState(propCars || []);
    const [selectedCars, setSelectedCars] = useState([null, null]);
    const [loading, setLoading] = useState(!propCars);
    const [car1Services, setCar1Services] = useState([]);
    const [car2Services, setCar2Services] = useState([]);

    useEffect(() => {
        if (!propCars) {
            fetchCars();
        }
    }, [propCars]);

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
            const response = await api.get('/api/cars/my-cars');
            setCars(response.data.data || response.data);
        } catch (error) {
            toast.error('Failed to fetch cars');
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async (carId, setServices) => {
        try {
            const response = await api.get(`/api/services/${carId}`);
            setServices(response.data.data || response.data || []);
        } catch (error) {
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
            case 'better': return 'text-green-700 bg-green-100 border-green-200';
            case 'worse': return 'text-red-700 bg-red-100 border-red-200';
            case 'equal': return 'text-blue-700 bg-blue-100 border-blue-200';
            default: return 'text-gray-700 bg-gray-100 border-gray-200';
        }
    };

    const getScoreIcon = (score) => {
        switch (score) {
            case 'better': return '✓';
            case 'worse': return '✗';
            case 'equal': return '=';
            default: return '-';
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                </div>
            </div>
        );
    }

    const comparisonFeatures = [
        { field: 'brand', label: 'Brand', icon: '🏢' },
        { field: 'model', label: 'Model', icon: '🚗' },
        { field: 'year', label: 'Year', icon: '📅', scorable: true },
        { field: 'price', label: 'Price', icon: '💰', format: (value) => value ? `$${value.toLocaleString()}` : 'N/A', scorable: true },
        { field: 'color', label: 'Color', icon: '🎨' },
        { field: 'mileage', label: 'Mileage', icon: '📏', format: (value) => value ? `${value.toLocaleString()} mi` : 'N/A', scorable: true },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl w-full max-w-6xl my-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-4 sm:p-6 rounded-t-2xl z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold mb-1">⚖️ Vehicle Comparison</h2>
                            <p className="text-sm sm:text-base text-white/90">Compare two vehicles side-by-side</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold transition-all duration-200 hover:rotate-90 touch-target"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                    {/* Car Selection */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        {/* Car 1 Selection */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 sm:p-6 border-2 border-blue-200 shadow-md">
                            <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-4">🚗 First Vehicle</h3>
                            {selectedCars[0] ? (
                                <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-blue-300">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="text-base sm:text-lg font-bold text-gray-900">{selectedCars[0].brand} {selectedCars[0].model}</h4>
                                            <p className="text-sm text-gray-600">{selectedCars[0].year}</p>
                                        </div>
                                        <button
                                            onClick={() => clearSelection(0)}
                                            className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold transition-all touch-target"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    {selectedCars[0].image && (
                                        <img
                                            src={getImageUrl(selectedCars[0].image)}
                                            alt={`${selectedCars[0].brand} ${selectedCars[0].model}`}
                                            className="w-full h-32 sm:h-40 object-cover rounded-lg shadow-md"
                                            onError={handleImageError}
                                        />
                                    )}
                                </div>
                            ) : (
                                <select
                                    onChange={(e) => {
                                        const car = cars.find(c => c._id === e.target.value);
                                        handleCarSelect(0, car);
                                    }}
                                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base font-medium transition-all touch-target"
                                >
                                    <option value="">Choose a vehicle...</option>
                                    {cars.filter(c => c._id !== selectedCars[1]?._id).map(car => (
                                        <option key={car._id} value={car._id}>
                                            {car.brand} {car.model} ({car.year})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Car 2 Selection */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 sm:p-6 border-2 border-green-200 shadow-md">
                            <h3 className="text-lg sm:text-xl font-bold text-green-900 mb-4">🚙 Second Vehicle</h3>
                            {selectedCars[1] ? (
                                <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-green-300">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="text-base sm:text-lg font-bold text-gray-900">{selectedCars[1].brand} {selectedCars[1].model}</h4>
                                            <p className="text-sm text-gray-600">{selectedCars[1].year}</p>
                                        </div>
                                        <button
                                            onClick={() => clearSelection(1)}
                                            className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold transition-all touch-target"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    {selectedCars[1].image && (
                                        <img
                                            src={getImageUrl(selectedCars[1].image)}
                                            alt={`${selectedCars[1].brand} ${selectedCars[1].model}`}
                                            className="w-full h-32 sm:h-40 object-cover rounded-lg shadow-md"
                                            onError={handleImageError}
                                        />
                                    )}
                                </div>
                            ) : (
                                <select
                                    onChange={(e) => {
                                        const car = cars.find(c => c._id === e.target.value);
                                        handleCarSelect(1, car);
                                    }}
                                    className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base font-medium transition-all touch-target"
                                >
                                    <option value="">Choose a vehicle...</option>
                                    {cars.filter(c => c._id !== selectedCars[0]?._id).map(car => (
                                        <option key={car._id} value={car._id}>
                                            {car.brand} {car.model} ({car.year})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Comparison Results */}
                    {selectedCars[0] && selectedCars[1] && (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden mb-6">
                                <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-4 border-b-2 border-gray-300">
                                    <h3 className="text-xl font-bold text-gray-900">📊 Detailed Comparison</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Feature</th>
                                                <th className="px-6 py-4 text-left text-sm font-bold text-blue-700 uppercase">{selectedCars[0].brand} {selectedCars[0].model}</th>
                                                <th className="px-6 py-4 text-left text-sm font-bold text-green-700 uppercase">{selectedCars[1].brand} {selectedCars[1].model}</th>
                                                <th className="px-6 py-4 text-center text-sm font-bold text-purple-700 uppercase">Winner</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {comparisonFeatures.map(({ field, label, icon, format, scorable }) => {
                                                const value1 = getComparisonValue(selectedCars[0], field);
                                                const value2 = getComparisonValue(selectedCars[1], field);
                                                const score = getComparisonScore(selectedCars[0], selectedCars[1], field);

                                                return (
                                                    <tr key={field} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm font-semibold text-gray-900">{icon} {label}</span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {format ? format(value1) : value1}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {format ? format(value2) : value2}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            {scorable ? (
                                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(score)}`}>
                                                                    {getScoreIcon(score)} {score === 'better' ? 'Car 1' : score === 'worse' ? 'Car 2' : 'Tie'}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4 mb-6">
                                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-4">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Comparison Details</h3>
                                    <div className="space-y-4">
                                        {comparisonFeatures.map(({ field, label, icon, format, scorable }) => {
                                            const value1 = getComparisonValue(selectedCars[0], field);
                                            const value2 = getComparisonValue(selectedCars[1], field);
                                            const score = getComparisonScore(selectedCars[0], selectedCars[1], field);

                                            return (
                                                <div key={field} className="border-2 border-gray-100 rounded-xl p-3">
                                                    <div className="font-semibold text-gray-700 mb-2 text-sm">{icon} {label}</div>
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-2">
                                                            <div className="text-xs text-blue-600 font-medium mb-1">Car 1</div>
                                                            <div className="font-bold text-gray-900">{format ? format(value1) : value1}</div>
                                                        </div>
                                                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-2">
                                                            <div className="text-xs text-green-600 font-medium mb-1">Car 2</div>
                                                            <div className="font-bold text-gray-900">{format ? format(value2) : value2}</div>
                                                        </div>
                                                    </div>
                                                    {scorable && (
                                                        <div className="mt-2 text-center">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(score)}`}>
                                                                {getScoreIcon(score)} {score === 'better' ? 'Car 1 Wins' : score === 'worse' ? 'Car 2 Wins' : 'Tie'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Service History */}
                            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden mb-6">
                                <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-4 sm:px-6 py-4 border-b-2 border-purple-200">
                                    <h3 className="text-lg sm:text-xl font-bold text-purple-900">🔧 Service History Comparison</h3>
                                </div>
                                <div className="p-4 sm:p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        {/* Car 1 Services */}
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                                            <h4 className="text-base sm:text-lg font-bold text-blue-900 mb-3">
                                                {selectedCars[0].brand} {selectedCars[0].model}
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center bg-white rounded-lg p-3">
                                                    <span className="text-sm text-gray-600">Total Services</span>
                                                    <span className="text-lg font-bold text-blue-600">{car1Services.length}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white rounded-lg p-3">
                                                    <span className="text-sm text-gray-600">Total Cost</span>
                                                    <span className="text-lg font-bold text-green-600">
                                                        ${car1Services.reduce((sum, s) => sum + (s.cost || 0), 0).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white rounded-lg p-3">
                                                    <span className="text-sm text-gray-600">Avg. Cost</span>
                                                    <span className="text-lg font-bold text-purple-600">
                                                        ${car1Services.length > 0 ? (car1Services.reduce((sum, s) => sum + (s.cost || 0), 0) / car1Services.length).toFixed(2) : '0.00'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Car 2 Services */}
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
                                            <h4 className="text-base sm:text-lg font-bold text-green-900 mb-3">
                                                {selectedCars[1].brand} {selectedCars[1].model}
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center bg-white rounded-lg p-3">
                                                    <span className="text-sm text-gray-600">Total Services</span>
                                                    <span className="text-lg font-bold text-blue-600">{car2Services.length}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white rounded-lg p-3">
                                                    <span className="text-sm text-gray-600">Total Cost</span>
                                                    <span className="text-lg font-bold text-green-600">
                                                        ${car2Services.reduce((sum, s) => sum + (s.cost || 0), 0).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white rounded-lg p-3">
                                                    <span className="text-sm text-gray-600">Avg. Cost</span>
                                                    <span className="text-lg font-bold text-purple-600">
                                                        ${car2Services.length > 0 ? (car2Services.reduce((sum, s) => sum + (s.cost || 0), 0) / car2Services.length).toFixed(2) : '0.00'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Empty State */}
                    {!selectedCars[0] && !selectedCars[1] && (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300 p-8 sm:p-12 text-center">
                            <div className="text-5xl sm:text-6xl mb-4">⚖️</div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Select Two Vehicles</h3>
                            <p className="text-sm sm:text-base text-gray-600">Choose two vehicles above to see a detailed comparison</p>
                        </div>
                    )}

                    {/* Close Button */}
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white py-3 px-8 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 touch-target"
                        >
                            Close Comparison
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarComparison;
