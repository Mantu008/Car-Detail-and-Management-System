import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const Home = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            navigate('/admin/dashboard');
        }
    }, [isAuthenticated, user, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 relative z-10">
                    <div className="text-center">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 animate-slide-down">
                            Vehicle Detail and Management System
                        </h1>
                        <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-blue-100 max-w-3xl mx-auto px-4 animate-slide-up">
                            Efficiently manage your vehicle inventory and service records
                        </p>

                        {isAuthenticated ? (
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
                                <Link
                                    to="/my-cars"
                                    className="w-full sm:w-auto bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 touch-target"
                                >
                                    View My Vehicles
                                </Link>
                                {user?.role === 'admin' && (
                                    <Link
                                        to="/cars"
                                        className="w-full sm:w-auto bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 touch-target"
                                    >
                                        Browse All Vehicles
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
                                <Link
                                    to="/register"
                                    className="w-full sm:w-auto bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 touch-target"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                <div className="text-center mb-10 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
                        Why Choose Our System?
                    </h2>
                    <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
                        Comprehensive vehicle management solution for individuals and businesses
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl text-center transition-all duration-300 hover:-translate-y-1 card-premium">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                            <span className="text-3xl sm:text-4xl">🚗</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">Vehicle Management</h3>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Add, edit, and manage your vehicle inventory with detailed information including brand, model, year, and specifications.
                        </p>
                    </div>

                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl text-center transition-all duration-300 hover:-translate-y-1 card-premium">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                            <span className="text-3xl sm:text-4xl">🔧</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">Service Tracking</h3>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Keep track of all maintenance and repair services with detailed records, costs, and service history.
                        </p>
                    </div>

                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl text-center transition-all duration-300 hover:-translate-y-1 card-premium md:col-span-2 lg:col-span-1">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                            <span className="text-3xl sm:text-4xl">👤</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">User Management</h3>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Secure user authentication with role-based access control for both regular users and administrators.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            {isAuthenticated && (
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white py-12 sm:py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8">Welcome back, {user?.name}!</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
                                <div className="text-4xl sm:text-5xl font-bold mb-2">📊</div>
                                <h3 className="text-lg sm:text-xl font-semibold mb-2">Dashboard</h3>
                                <p className="text-blue-100 text-sm sm:text-base">View your vehicle statistics and quick actions</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
                                <div className="text-4xl sm:text-5xl font-bold mb-2">⚙️</div>
                                <h3 className="text-lg sm:text-xl font-semibold mb-2">Management</h3>
                                <p className="text-blue-100 text-sm sm:text-base">Manage your vehicles and services efficiently</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
                                <div className="text-4xl sm:text-5xl font-bold mb-2">🔒</div>
                                <h3 className="text-lg sm:text-xl font-semibold mb-2">Secure</h3>
                                <p className="text-blue-100 text-sm sm:text-base">Your data is protected with industry-standard security</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
