import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useNotifications } from '../../context/notificationContext';
import { Avatar, Icon, PageLoader } from '../../components/ui';
import { LogoMark } from '../../components/layout/Logo';

export const ADMIN_NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'grid' },
  { to: '/admin/vehicles', label: 'Vehicles', icon: 'car' },
  { to: '/admin/users', label: 'Users', icon: 'users' },
  { to: '/admin/suspicious', label: 'Flagged vehicles', icon: 'flag' },
  { to: '/admin/support', label: 'Support tickets', icon: 'lifebuoy' },
  { to: '/admin/announcements', label: 'Announcements', icon: 'megaphone' },
  { to: '/admin/logs', label: 'Audit log', icon: 'list' },
];

const Sidebar = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-ink-950 text-slate-300">
      <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-brand-600/25 blur-[80px]" aria-hidden="true" />
      <Link to="/admin" onClick={onNavigate} className="relative flex h-16 items-center gap-2.5 px-5">
        <LogoMark className="h-8 w-8 rounded-lg ring-1 ring-white/10" />
        <div>
          <p className="font-display text-[15px] font-bold text-white">Car Manager</p>
          <p className="text-[11px] text-slate-500">Administration</p>
        </div>
      </Link>

      <nav className="relative flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Manage</p>
        {ADMIN_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white shadow-btn-brand'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon name={item.icon} /> {item.label}
          </NavLink>
        ))}
        <div className="my-3 border-t border-white/10" />
        <NavLink
          to="/my-cars"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white"
        >
          <Icon name="arrowLeft" /> Open user app
        </NavLink>
      </nav>

      <div className="relative border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <Avatar name={user?.name} size="h-8 w-8 text-xs !ring-white/10" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="rounded-md p-2 text-slate-400 hover:bg-white/5 hover:text-white"
            title="Sign out"
            aria-label="Sign out"
          >
            <Icon name="logout" />
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const current = ADMIN_NAV.find((i) => location.pathname.startsWith(i.to));

  useEffect(() => setDrawerOpen(false), [location.pathname]);

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-slate-900/60" onClick={() => setDrawerOpen(false)} />
          <div className="relative h-full w-72 max-w-[85%] animate-pop-in">
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button type="button" className="btn btn-ghost btn-icon -ml-2 lg:hidden" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <Icon name="menu" className="h-5 w-5" />
          </button>
          <p className="text-sm font-medium text-slate-500">
            Admin <span className="mx-1.5 text-slate-300">/</span>
            <span className="text-slate-900">{current?.label || 'Overview'}</span>
          </p>
          <Link to="/notifications" className="btn btn-ghost btn-icon relative ml-auto" aria-label="Notifications">
            <Icon name="bell" className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
