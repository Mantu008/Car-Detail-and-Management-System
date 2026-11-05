import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} Car Manager · Vehicle Detail &amp; Management System</p>
        <p>Final year project</p>
      </div>
    </footer>
  </div>
);

export default MainLayout;
