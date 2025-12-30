import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import { toast } from 'react-toastify';
import CarCard from '../components/CarCard';
import { useAuth } from '../context/authContext';

const MyCars = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchMyCars();
    }, []);

    const fetchMyCars = async () => {
        try {
            const response = await api.get('/api/cars/my-cars');
            setCars(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch your cars');
            console.error('Error fetching my cars:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCar = async (carId) => {
        if (window.confirm('Are you sure you want to delete this car? This action cannot be undone.')) {
            try {
                await api.delete(`/api/cars/${carId}`);
                setCars(cars.filter(car => car._id !== carId));
                toast.success('Car deleted successfully!');
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete car');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 sm:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">My Vehicles</h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Manage your vehicle inventory and service records.
                    </p>
                </div>

                {/* Add Car Button */}
                <div className="mb-6">
                    <Link
                        to="/add-car"
                        className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 touch-target"
                    >
                        <span className="mr-2 text-xl">+</span>
                        Add New Vehicle
                    </Link>
                </div>

                {/* Cars Grid */}
                {cars.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 bg-white rounded-2xl shadow-lg">
                        <div className="text-5xl sm:text-6xl mb-4">🚗</div>
                        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">No vehicles found</h3>
                        <p className="text-gray-600 mb-6 px-4 text-sm sm:text-base">
                            You haven't added any vehicles yet. Start by adding your first vehicle!
                        </p>
                        <Link
                            to="/add-car"
                            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 touch-target"
                        >
                            <span className="mr-2 text-xl">+</span>
                            Add Your First Vehicle
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {cars.map(car => (
                            <div key={car._id} className="relative group">
                                <CarCard car={car} />
                                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <Link
                                        to={`/edit-car/${car._id}`}
                                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 sm:p-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 touch-target"
                                        title="Edit Vehicle"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteCar(car._id)}
                                        className="bg-red-600 hover:bg-red-700 text-white p-2 sm:p-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 touch-target"
                                        title="Delete Vehicle"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats */}
                {cars.length > 0 && (
                    <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Your Vehicle Statistics</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-md transition-shadow duration-200">
                                <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-1">{cars.length}</div>
                                <div className="text-sm sm:text-base text-gray-700 font-medium">Total Vehicles</div>
                            </div>
                            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-md transition-shadow duration-200">
                                <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-1">
                                    {cars.reduce((sum, car) => sum + (car.services?.length || 0), 0)}
                                </div>
                                <div className="text-sm sm:text-base text-gray-700 font-medium">Total Services</div>
                            </div>
                            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-md transition-shadow duration-200 sm:col-span-2 lg:col-span-1">
                                <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-1">
                                    ${cars.reduce((sum, car) => sum + (car.price || 0), 0).toLocaleString()}
                                </div>
                                <div className="text-sm sm:text-base text-gray-700 font-medium">Total Value</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCars;
