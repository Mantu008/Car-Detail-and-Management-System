import { Link, Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Logo from './Logo';
import { useAuth } from '../../context/authContext';

const productLinks = [
  { to: '/my-cars', label: 'My vehicles' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/tools', label: 'Tools' },
];

const accountLinks = [
  { to: '/settings', label: 'Account settings' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/support', label: 'Help & support' },
];

const Footer = () => {
  const { isAuthenticated } = useAuth();
  const guestLinks = [
    { to: '/register', label: 'Create account' },
    { to: '/login', label: 'Sign in' },
  ];

  return (
    <footer className="border-t border-slate-200/80 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Vehicle records, service history, fuel and running costs for individuals and small fleets, all in one
            place.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Product</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {(isAuthenticated ? productLinks : guestLinks).map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-slate-500 transition-colors hover:text-slate-900">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {isAuthenticated && (
          <div>
            <p className="text-sm font-semibold text-slate-900">Account</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {accountLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-slate-500 transition-colors hover:text-slate-900">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Car Manager. All rights reserved.</p>
          <p>Vehicle Detail &amp; Management System</p>
        </div>
      </div>
    </footer>
  );
};

const MainLayout = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default MainLayout;
