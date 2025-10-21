import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const Home = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="max-w-7xl mx-auto px-4 py-20">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Car Detail and Management System
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-blue-100">
                            Efficiently manage your car inventory and service records
                        </p>

                        {isAuthenticated ? (
                            <div className="space-x-4">
                                <Link
                                    to="/my-cars"
                                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                                >
                                    View My Cars
                                </Link>
                                <Link
                                    to="/cars"
                                    className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                                >
                                    Browse All Cars
                                </Link>
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <Link
                                    to="/register"
                                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                                >
                                    Get Started
                                </Link>
                                <Link
                                    to="/cars"
                                    className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                                >
                                    Browse Cars
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Why Choose Our System?
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Comprehensive car management solution for individuals and businesses
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🚗</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Car Management</h3>
                        <p className="text-gray-600">
                            Add, edit, and manage your car inventory with detailed information including brand, model, year, and specifications.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🔧</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Service Tracking</h3>
                        <p className="text-gray-600">
                            Keep track of all maintenance and repair services with detailed records, costs, and service history.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">👤</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">User Management</h3>
                        <p className="text-gray-600">
                            Secure user authentication with role-based access control for both regular users and administrators.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            {isAuthenticated && (
                <div className="bg-blue-600 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold mb-8">Welcome back, {user?.name}!</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <div className="text-4xl font-bold mb-2">📊</div>
                                <h3 className="text-xl font-semibold mb-2">Dashboard</h3>
                                <p className="text-blue-100">View your car statistics and quick actions</p>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2">⚙️</div>
                                <h3 className="text-xl font-semibold mb-2">Management</h3>
                                <p className="text-blue-100">Manage your cars and services efficiently</p>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2">🔒</div>
                                <h3 className="text-xl font-semibold mb-2">Secure</h3>
                                <p className="text-blue-100">Your data is protected with industry-standard security</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
