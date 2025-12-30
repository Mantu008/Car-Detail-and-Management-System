import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const menuItems = [
        { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/admin/users', icon: '👥', label: 'User Management' },
        { path: '/admin/suspicious', icon: '🚨', label: 'Suspicious Activity' },
        { path: '/admin/logs', icon: '📜', label: 'Audit Logs' },
        { path: '/admin/support', icon: '🎫', label: 'Support Tickets' },
        { path: '/admin/announcements', icon: '📢', label: 'Announcements' },
    ];

    const isActive = (path) => location.pathname === path;

    // Auto-collapse sidebar on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
                setIsMobileSidebarOpen(false);
            }
        };

        handleResize(); // Set initial state
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [location.pathname]);

    const toggleSidebar = () => {
        if (window.innerWidth < 1024) {
            setIsMobileSidebarOpen(!isMobileSidebarOpen);
        } else {
            setIsSidebarOpen(!isSidebarOpen);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Mobile Overlay */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsMobileSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar - Desktop */}
            <div
                className={`${isSidebarOpen ? 'w-64' : 'w-20'
                    } bg-gray-900 text-white transition-all duration-300 hidden lg:flex flex-col`}
            >
                <div className="p-4 flex items-center justify-between border-b border-gray-800">
                    {isSidebarOpen && (
                        <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Admin Panel
                        </span>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors touch-target"
                        title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        {isSidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                    <ul className="space-y-2 px-2">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center p-3 rounded-lg transition-all duration-200 ${isActive(item.path)
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        }`}
                                    title={!isSidebarOpen ? item.label : ''}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    {isSidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center p-2 rounded-lg bg-gray-800 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold shadow-md">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        {isSidebarOpen && (
                            <div className="ml-3 overflow-hidden flex-1">
                                <p className="text-sm font-medium truncate">{user?.name}</p>
                                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center p-2 text-red-400 hover:bg-gray-800 rounded-lg transition-colors touch-target"
                        title="Logout"
                    >
                        <span>🚪</span>
                        {isSidebarOpen && <span className="ml-2">Logout</span>}
                    </button>
                </div>
            </div>

            {/* Sidebar - Mobile */}
            <div
                className={`fixed inset-y-0 left-0 w-64 bg-gray-900 text-white z-40 transform transition-transform duration-300 lg:hidden ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-4 flex items-center justify-between border-b border-gray-800">
                    <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Admin Panel
                    </span>
                    <button
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors touch-target"
                    >
                        ✕
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 h-[calc(100vh-160px)]">
                    <ul className="space-y-2 px-2">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center p-3 rounded-lg transition-all duration-200 touch-target ${isActive(item.path)
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="ml-3 font-medium">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center p-2 rounded-lg bg-gray-800 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold shadow-md">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 overflow-hidden flex-1">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center p-2 text-red-400 hover:bg-gray-800 rounded-lg transition-colors touch-target"
                    >
                        <span>🚪</span>
                        <span className="ml-2">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10">
                    <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors touch-target mr-4"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                            {menuItems.find((item) => item.path === location.pathname)?.label || 'Admin Area'}
                        </h2>

                        {/* Desktop Sidebar Toggle */}
                        <button
                            onClick={toggleSidebar}
                            className="hidden lg:block p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors touch-target"
                            title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
