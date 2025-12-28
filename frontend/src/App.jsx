import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/authContext';
import { NotificationProvider } from './context/notificationContext';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingOverlay from './components/LoadingOverlay';

// Pages
import Home from './pages/Home';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Cars from './pages/Cars';
import MyCars from './pages/MyCars';
import AddCar from './pages/AddCar';
import EditCar from './pages/EditCar';
import CarDetail from './pages/CarDetail';
import FeaturesDashboard from './pages/FeaturesDashboard';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import SuspiciousActivity from './pages/admin/SuspiciousActivity';
import AuditLogs from './pages/admin/AuditLogs';
import SupportAdmin from './pages/admin/SupportAdmin';
import AnnouncementAdmin from './pages/admin/AnnouncementAdmin';

// User Pages
import UserAnalytics from './pages/user/UserAnalytics';
import Support from './pages/user/Support';
import Notifications from './pages/user/Notifications';

function App() {
    return (
        <AuthProvider>
            <NotificationProvider>
                <Router>
                    <div className="App">
                        <LoadingOverlay />
                        <main>
                            <Routes>
                                {/* Admin Routes (No Navbar) */}
                                <Route
                                    path="/admin"
                                    element={
                                        <ProtectedRoute adminOnly={true}>
                                            <AdminLayout />
                                        </ProtectedRoute>
                                    }
                                >
                                    <Route index element={<Navigate to="dashboard" replace />} />
                                    <Route path="dashboard" element={<AdminDashboard />} />
                                    <Route path="users" element={<UserManagement />} />
                                    <Route path="suspicious" element={<SuspiciousActivity />} />
                                    <Route path="logs" element={<AuditLogs />} />
                                    <Route path="support" element={<SupportAdmin />} />
                                    <Route path="announcements" element={<AnnouncementAdmin />} />
                                </Route>

                                {/* User Routes with Navbar */}
                                <Route element={<MainLayout />}>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/login" element={<LoginForm />} />
                                    <Route path="/register" element={<RegisterForm />} />
                                    <Route path="/cars" element={<Cars />} />
                                    <Route
                                        path="/my-cars"
                                        element={
                                            <ProtectedRoute>
                                                <MyCars />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/add-car"
                                        element={
                                            <ProtectedRoute>
                                                <AddCar />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/edit-car/:id"
                                        element={
                                            <ProtectedRoute>
                                                <EditCar />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route path="/cars/:id" element={<CarDetail />} />
                                    <Route
                                        path="/features"
                                        element={
                                            <ProtectedRoute>
                                                <FeaturesDashboard />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* User Routes */}
                                    <Route
                                        path="/analytics"
                                        element={
                                            <ProtectedRoute>
                                                <UserAnalytics />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/support"
                                        element={
                                            <ProtectedRoute>
                                                <Support />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/notifications"
                                        element={
                                            <ProtectedRoute>
                                                <Notifications />
                                            </ProtectedRoute>
                                        }
                                    />
                                </Route>
                            </Routes>
                        </main>

                        <ToastContainer
                            position="top-right"
                            autoClose={3000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                        />
                    </div>
                </Router>
            </NotificationProvider>
        </AuthProvider >
    );
}

export default App;
