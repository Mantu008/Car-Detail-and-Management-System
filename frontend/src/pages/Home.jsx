import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { Icon, PageLoader } from '../components/ui';
import Dashboard from './Dashboard';

const features = [
  { icon: 'car', title: 'Vehicle records', text: 'Cars, bikes, trucks and autos with photos, price, odometer and notes.' },
  { icon: 'wrench', title: 'Service history', text: 'Every repair and maintenance job with cost, provider and next due date.' },
  { icon: 'fuel', title: 'Fuel log', text: 'Record fill-ups to see km/L and running cost per kilometre.' },
  { icon: 'chart', title: 'Spending analytics', text: 'Monthly spend, cost per vehicle and service-type breakdowns.' },
  { icon: 'file', title: 'PDF & Excel reports', text: 'Export your fleet, service history or monthly summaries.' },
  { icon: 'qr', title: 'QR vehicle cards', text: 'Print a QR code that opens the vehicle page on any phone.' },
];

const steps = [
  { title: 'Add a vehicle', text: 'Enter the basics and upload a photo.' },
  { title: 'Log services & fuel', text: 'Record work done and fill-ups as they happen.' },
  { title: 'Review costs', text: 'See trends, compare vehicles and export reports.' },
];

// A static, data-free preview of the product used in the hero.
const ProductPreview = () => (
  <div className="card overflow-hidden">
    <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
    </div>
    <div className="space-y-4 p-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          ['Vehicles', '3'],
          ['Services', '14'],
          ['Spent this year', '₹48,200'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 p-3">
            <p className="text-[11px] text-slate-500">{label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-slate-200 p-3">
        <p className="text-[11px] text-slate-500">Monthly spend</p>
        <div className="mt-3 flex h-24 items-end gap-2">
          {[35, 60, 28, 80, 45, 66].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-brand-500/80" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      {[
        ['Maruti Suzuki Swift', 'Oil change · 12 Oct', '₹2,450'],
        ['Honda Activa 6G', 'General service · 2 Oct', '₹850'],
      ].map(([name, meta, cost]) => (
        <div key={name} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-500">
              <Icon name="car" />
            </span>
            <div>
              <p className="text-sm font-medium">{name}</p>
              <p className="text-xs text-slate-500">{meta}</p>
            </div>
          </div>
          <span className="text-sm font-medium tabular-nums">{cost}</span>
        </div>
      ))}
    </div>
  </div>
);

const Landing = () => (
  <>
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Vehicle Detail &amp; Management System
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.1] sm:text-5xl">
            One place for your vehicles, their service history and what they cost.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600">
            Keep records for every car, bike or truck you own, log maintenance and fuel, and get clear reports
            without spreadsheets.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="btn btn-primary btn-lg">
              Create free account <Icon name="arrowRight" />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign in
            </Link>
          </div>
        </div>
        <ProductPreview />
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold sm:text-3xl">Everything you need to run your vehicles</h2>
        <p className="mt-3 text-slate-600">Built for individuals and small fleets who want records they can trust.</p>
      </div>
      <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="bg-white p-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Icon name={f.icon} />
            </span>
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-1.5 text-sm text-slate-600">{f.text}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <ol className="mt-8 grid gap-8 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-xl bg-slate-900 px-6 py-8 sm:flex-row sm:items-center sm:px-10">
          <div>
            <p className="text-lg font-semibold text-white">Ready to get organised?</p>
            <p className="mt-1 text-sm text-slate-400">It takes less than a minute to add your first vehicle.</p>
          </div>
          <Link to="/register" className="btn btn-lg bg-white text-slate-900 hover:bg-slate-100">
            Get started
          </Link>
        </div>
      </div>
    </section>
  </>
);

const Home = () => {
  const { isAuthenticated, isAdmin, initializing } = useAuth();
  if (initializing) return <PageLoader />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return isAuthenticated ? <Dashboard /> : <Landing />;
};

export default Home;
