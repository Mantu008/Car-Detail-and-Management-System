import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useNotifications } from '../context/notificationContext';
import QRCodeScanner from './QRCodeScanner';

const Navbar = () => {
    const { user, logout, isAuthenticated, isAdmin, loading } = useAuth();
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();
    const location = useLocation();
    const [showQRScanner, setShowQRScanner] = useState(false);

    // Defensively hide Navbar on admin routes
    const currentPath = location.pathname.toLowerCase();
    const isAdminRoute = currentPath.startsWith('/admin') || currentPath.includes('/admin/');

    console.log('Navbar - Current path:', location.pathname, 'Is Admin?', isAdminRoute);

    if (isAdminRoute) {
        console.log('Navbar hidden for admin route');
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to={isAdmin ? "/admin/dashboard" : "/"} className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">🚗</span>
                            </div>
                            <span className="text-xl font-bold text-gray-800">Vehicle Management</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link
                            to="/"
                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Home
                        </Link>

                        {isAdmin && (
                            <Link
                                to="/cars"
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                All Vehicles
                            </Link>
                        )}

                        <Link
                            to="/features"
                            className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            🚀 Features
                        </Link>

                        <button
                            onClick={() => setShowQRScanner(true)}
                            className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            📱 Scan QR
                        </button>

                        {loading ? (
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-gray-700 text-sm">Loading...</span>
                            </div>
                        ) : isAuthenticated ? (
                            <>
                                <Link
                                    to="/my-cars"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    My Vehicles
                                </Link>

                                <Link
                                    to="/analytics"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Analytics
                                </Link>

                                <Link
                                    to="/support"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Support
                                </Link>

                                <Link
                                    to="/notifications"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    🔔
                                </Link>

                                {isAdmin && (
                                    <Link
                                        to="/admin/dashboard"
                                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Admin
                                    </Link>
                                )}

                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-700 text-sm">
                                        Welcome, {user?.name}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* QR Scanner Modal */}
            {showQRScanner && (
                <QRCodeScanner
                    onClose={() => setShowQRScanner(false)}
                />
            )}
        </nav>
    );
};

export default Navbar;
