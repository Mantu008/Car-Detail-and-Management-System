import React, { useState, useEffect } from 'react';
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Defensively hide Navbar on admin routes
    const currentPath = location.pathname.toLowerCase();
    const isAdminRoute = currentPath.startsWith('/admin') || currentPath.includes('/admin/');

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isAdminRoute) {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <nav className="bg-white shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link to={isAdmin ? "/admin/dashboard" : "/"} className="flex items-center space-x-2 group">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
                                    <span className="text-white font-bold text-xl">🚗</span>
                                </div>
                                <span className="text-xl font-bold text-gray-800 hidden sm:block">Vehicle Management</span>
                                <span className="text-lg font-bold text-gray-800 sm:hidden">VM</span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
                            <Link
                                to="/"
                                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                            >
                                Home
                            </Link>

                            {isAdmin && (
                                <Link
                                    to="/cars"
                                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                                >
                                    All Vehicles
                                </Link>
                            )}

                            <Link
                                to="/features"
                                className="text-gray-700 hover:text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                            >
                                🚀 Features
                            </Link>

                            <button
                                onClick={() => setShowQRScanner(true)}
                                className="text-gray-700 hover:text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                            >
                                📱 Scan QR
                            </button>

                            {loading ? (
                                <div className="flex items-center space-x-2 px-3">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                                </div>
                            ) : isAuthenticated ? (
                                <>
                                    <Link
                                        to="/my-cars"
                                        className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                                    >
                                        My Vehicles
                                    </Link>

                                    <Link
                                        to="/analytics"
                                        className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                                    >
                                        Analytics
                                    </Link>

                                    <Link
                                        to="/support"
                                        className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                                    >
                                        Support
                                    </Link>

                                    <Link
                                        to="/notifications"
                                        className="relative text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                                    >
                                        🔔
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </Link>

                                    {isAdmin && (
                                        <Link
                                            to="/admin/dashboard"
                                            className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                                        >
                                            Admin
                                        </Link>
                                    )}

                                    <div className="flex items-center space-x-3 ml-2 pl-2 border-l border-gray-200">
                                        <div className="flex items-center space-x-2">
                                            <div className="hidden lg:flex items-center space-x-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                                    {user?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-gray-700 text-sm font-medium">{user?.name}</span>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 touch-target"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Link
                                        to="/login"
                                        className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 touch-target"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200 touch-target"
                                aria-expanded={isMobileMenuOpen}
                            >
                                <span className="sr-only">Open main menu</span>
                                {!isMobileMenuOpen ? (
                                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                ) : (
                                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="px-2 pt-2 pb-3 space-y-1 bg-gradient-to-b from-white to-gray-50 border-t border-gray-200">
                        <Link
                            to="/"
                            className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 touch-target"
                        >
                            🏠 Home
                        </Link>

                        {isAdmin && (
                            <Link
                                to="/cars"
                                className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 touch-target"
                            >
                                🚙 All Vehicles
                            </Link>
                        )}

                        <Link
                            to="/features"
                            className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 touch-target"
                        >
                            🚀 Features
                        </Link>

                        <button
                            onClick={() => {
                                setShowQRScanner(true);
                                setIsMobileMenuOpen(false);
                            }}
                            className="w-full text-left block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 touch-target"
                        >
                            📱 Scan QR Code
                        </button>

                        {isAuthenticated ? (
                            <>
                                <div className="border-t border-gray-200 my-2"></div>

                                <Link
                                    to="/my-cars"
                                    className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 touch-target"
                                >
                                    🚗 My Vehicles
                                </Link>

                                <Link
                                    to="/analytics"
                                    className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 touch-target"
                                >
                                    📊 Analytics
                                </Link>

                                <Link
                                    to="/support"
                                    className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 touch-target"
                                >
                                    💬 Support
                                </Link>

                                <Link
                                    to="/notifications"
                                    className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 touch-target relative"
                                >
                                    🔔 Notifications
                                    {unreadCount > 0 && (
                                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Link>

                                {isAdmin && (
                                    <Link
                                        to="/admin/dashboard"
                                        className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 touch-target"
                                    >
                                        ⚙️ Admin Dashboard
                                    </Link>
                                )}

                                <div className="border-t border-gray-200 my-2"></div>

                                <div className="px-3 py-3">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-md">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 touch-target"
                                    >
                                        🚪 Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="border-t border-gray-200 my-2"></div>
                                <Link
                                    to="/login"
                                    className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 touch-target"
                                >
                                    🔑 Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="block mx-3 my-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg text-base font-medium text-center shadow-md hover:shadow-lg transition-all duration-200 touch-target"
                                >
                                    ✨ Create Account
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* QR Scanner Modal */}
            {showQRScanner && (
                <QRCodeScanner
                    onClose={() => setShowQRScanner(false)}
                />
            )}
        </>
    );
};

export default Navbar;
