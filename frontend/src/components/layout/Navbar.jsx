import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useNotifications } from '../../context/notificationContext';
import { Avatar, Icon } from '../ui';
import Logo from './Logo';
import QRCodeScanner from '../QRCodeScanner';
import useClickOutside from './useClickOutside';

const userLinks = [
  { to: '/', label: 'Dashboard', icon: 'home', end: true },
  { to: '/my-cars', label: 'My vehicles', icon: 'car' },
  { to: '/analytics', label: 'Analytics', icon: 'chart' },
  { to: '/tools', label: 'Tools', icon: 'calculator' },
  { to: '/support', label: 'Support', icon: 'lifebuoy' },
];

const navClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
  }`;

const UserMenu = ({ user, isAdmin, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full p-0.5 pr-2 hover:bg-slate-100"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar name={user.name} />
        <Icon name="chevronDown" className="h-4 w-4 text-slate-500" />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-60 animate-pop-in overflow-hidden rounded-lg border border-slate-200 bg-white shadow-pop" role="menu">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <div className="py-1">
            {isAdmin && (
              <Link to="/admin" onClick={close} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" role="menuitem">
                <Icon name="shield" /> Admin panel
              </Link>
            )}
            <Link to="/settings" onClick={close} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" role="menuitem">
              <Icon name="settings" /> Account settings
            </Link>
            <button
              type="button"
              onClick={() => {
                close();
                onLogout();
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              role="menuitem"
            >
              <Icon name="logout" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  // Leave the protected page first, otherwise its guard redirects to /login.
  const handleLogout = () => {
    navigate('/', { replace: true });
    logout();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />

        {isAuthenticated && (
          <nav className="hidden items-center gap-1 lg:flex">
            {userLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={navClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={() => setScannerOpen(true)}
            title="Scan a vehicle QR code"
            aria-label="Scan a vehicle QR code"
          >
            <Icon name="scan" className="h-[18px] w-[18px]" />
          </button>

          {isAuthenticated ? (
            <>
              <Link to="/notifications" className="btn btn-ghost btn-icon relative" aria-label={`Notifications (${unreadCount} unread)`}>
                <Icon name="bell" className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <div className="ml-1 hidden lg:block">
                <UserMenu user={user} isAdmin={isAdmin} onLogout={handleLogout} />
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-icon lg:hidden"
                onClick={() => setMobileOpen((v) => !v)}
                aria-expanded={mobileOpen}
                aria-label="Toggle menu"
              >
                <Icon name={mobileOpen ? 'x' : 'menu'} className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>

      {isAuthenticated && mobileOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-3 sm:px-6">
            {userLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium ${
                    isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon name={link.icon} /> {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                <Icon name="shield" /> Admin panel
              </NavLink>
            )}
            <NavLink to="/settings" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Icon name="settings" /> Account settings
            </NavLink>
          </nav>
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={user.name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
            <button type="button" onClick={handleLogout} className="btn btn-secondary btn-sm">
              <Icon name="logout" /> Sign out
            </button>
          </div>
        </div>
      )}

      {scannerOpen && <QRCodeScanner onClose={() => setScannerOpen(false)} />}
    </header>
  );
};

export default Navbar;
