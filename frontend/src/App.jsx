import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/authContext';
import { NotificationProvider } from './context/notificationContext';
import { ConfirmProvider } from './context/confirmContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute, { GuestRoute } from './components/ProtectedRoute';
import ScrollToTop from './components/layout/ScrollToTop';
import { PageLoader } from './components/ui';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MyCars from './pages/MyCars';
import CarDetail from './pages/CarDetail';
import { AddCar, EditCar } from './pages/CarEditor';
import NotFound from './pages/NotFound';

// Heavier / less-visited pages are split into their own chunks.
const Tools = lazy(() => import('./pages/Tools'));
const Settings = lazy(() => import('./pages/Settings'));
const UserAnalytics = lazy(() => import('./pages/user/UserAnalytics'));
const Support = lazy(() => import('./pages/user/Support'));
const Notifications = lazy(() => import('./pages/user/Notifications'));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminVehicles = lazy(() => import('./pages/admin/AdminVehicles'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const SuspiciousActivity = lazy(() => import('./pages/admin/SuspiciousActivity'));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'));
const SupportAdmin = lazy(() => import('./pages/admin/SupportAdmin'));
const AnnouncementAdmin = lazy(() => import('./pages/admin/AnnouncementAdmin'));

// Keep old URLs working.
const LegacyEditRedirect = () => <Navigate to={`/cars/${useParams().id}/edit`} replace />;

const user = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <NotificationProvider>
          <ConfirmProvider>
            <ScrollToTop />
            <Suspense fallback={<PageLoader className="min-h-screen" />}>
              <Routes>
                <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="vehicles" element={<AdminVehicles />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="suspicious" element={<SuspiciousActivity />} />
                  <Route path="support" element={<SupportAdmin />} />
                  <Route path="announcements" element={<AnnouncementAdmin />} />
                  <Route path="logs" element={<AuditLogs />} />
                </Route>

                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/my-cars" element={user(<MyCars />)} />
                  <Route path="/cars/new" element={user(<AddCar />)} />
                  <Route path="/cars/:id/edit" element={user(<EditCar />)} />
                  <Route path="/cars/:id" element={<CarDetail />} />
                  <Route path="/tools" element={user(<Tools />)} />
                  <Route path="/analytics" element={user(<UserAnalytics />)} />
                  <Route path="/support" element={user(<Support />)} />
                  <Route path="/notifications" element={user(<Notifications />)} />
                  <Route path="/settings" element={user(<Settings />)} />

                  <Route path="/cars" element={<Navigate to="/admin/vehicles" replace />} />
                  <Route path="/add-car" element={<Navigate to="/cars/new" replace />} />
                  <Route path="/edit-car/:id" element={<LegacyEditRedirect />} />
                  <Route path="/features" element={<Navigate to="/tools" replace />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
            <ToastContainer position="bottom-right" autoClose={3500} hideProgressBar newestOnTop closeOnClick pauseOnHover theme="light" />
          </ConfirmProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
