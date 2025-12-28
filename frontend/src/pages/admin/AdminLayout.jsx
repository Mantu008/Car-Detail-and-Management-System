import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const menuItems = [
        { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/admin/users', icon: '👥', label: 'User Management' },
        { path: '/admin/suspicious', icon: '🚨', label: 'Suspicious Activity' },
        { path: '/admin/logs', icon: '📜', label: 'Audit Logs' },
        { path: '/admin/support', icon: '🎫', label: 'Support Tickets' },
        { path: '/admin/announcements', icon: '📢', label: 'Announcements' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
                <div className="p-4 flex items-center justify-between border-b border-gray-800">
                    {isSidebarOpen && <span className="font-bold text-xl text-blue-400">Admin Panel</span>}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-gray-800 rounded-lg"
                    >
                        {isSidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-2 px-2">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center p-3 rounded-lg transition-colors ${isActive(item.path)
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        }`}
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
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        {isSidebarOpen && (
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-medium truncate">{user?.name}</p>
                                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center p-2 text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <span>🚪</span>
                        {isSidebarOpen && <span className="ml-2">Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10">
                    <div className="px-6 py-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {menuItems.find(item => item.path === location.pathname)?.label || 'Admin Area'}
                        </h2>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
