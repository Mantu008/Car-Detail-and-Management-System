import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { DashboardSkeleton, Icon } from '../components/ui';
import Dashboard from './Dashboard';

const features = [
  { icon: 'car', tone: 'bg-brand-50 text-brand-600 ring-brand-100', title: 'Vehicle records', text: 'Cars, bikes, trucks and autos with photos, price, odometer and notes, all in one tidy profile.' },
  { icon: 'wrench', tone: 'bg-amber-50 text-amber-600 ring-amber-100', title: 'Service history', text: 'Every repair and maintenance job with cost, provider and the next due date.' },
  { icon: 'fuel', tone: 'bg-emerald-50 text-emerald-600 ring-emerald-100', title: 'Fuel log', text: 'Record fill-ups and instantly see km/L and running cost per kilometre.' },
  { icon: 'chart', tone: 'bg-violet-50 text-violet-600 ring-violet-100', title: 'Spending analytics', text: 'Monthly spend, cost per vehicle and service-type breakdowns at a glance.' },
  { icon: 'file', tone: 'bg-rose-50 text-rose-600 ring-rose-100', title: 'PDF & Excel reports', text: 'Export your fleet, service history or monthly summaries in one click.' },
  { icon: 'qr', tone: 'bg-cyan-50 text-cyan-600 ring-cyan-100', title: 'QR vehicle cards', text: 'Print a QR code that opens the vehicle page on any phone, no app needed.' },
];

const steps = [
  { icon: 'plus', title: 'Add a vehicle', text: 'Enter the basics and upload a photo. It takes under a minute.' },
  { icon: 'wrench', title: 'Log services & fuel', text: 'Record work done and fill-ups as they happen, from any device.' },
  { icon: 'chart', title: 'Review your costs', text: 'See trends, compare vehicles and export reports when you need them.' },
];

const highlights = ['Set up in under a minute', 'Works on any device', 'Export to PDF & Excel'];

const vehicleTypes = ['Cars', 'Motorbikes', 'Scooters', 'Trucks', 'Autos', 'Commercial fleets'];

const faqs = [
  {
    q: 'Which vehicles can I track?',
    a: 'Cars, motorbikes, trucks, autos and anything else with an engine. Each vehicle gets its own profile, service history and fuel log.',
  },
  {
    q: 'Can I export my records?',
    a: 'Yes. Download your fleet, service history and monthly summaries as PDF or Excel files whenever you need them.',
  },
  {
    q: 'Does it work on my phone?',
    a: 'Car Manager is fully responsive, so you can log a service at the workshop or scan a vehicle QR code right from your phone.',
  },
  {
    q: 'How is my account protected?',
    a: 'Every account is protected by a password, and you can turn on two-factor authentication with any authenticator app from your settings.',
  },
];

// Simple SVG area chart used in the hero mock-up (static, no data).
const SparkArea = () => (
  <svg viewBox="0 0 300 90" className="h-24 w-full" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id="hero-area" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3767f8" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#3767f8" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M0 70 C30 62 45 40 75 44 S120 70 150 52 S200 18 225 26 S270 40 300 12 V90 H0 Z" fill="url(#hero-area)" />
    <path d="M0 70 C30 62 45 40 75 44 S120 70 150 52 S200 18 225 26 S270 40 300 12" fill="none" stroke="#3767f8" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// A static, data-free preview of the product used in the hero.
const ProductPreview = () => (
  <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
    <div className="absolute -inset-6 rounded-[2rem] bg-brand-500/20 blur-3xl" aria-hidden="true" />

    <div className="relative overflow-hidden rounded-2xl bg-white shadow-glow ring-1 ring-white/10">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-3 hidden h-5 flex-1 rounded-md bg-white text-[10px] leading-5 text-slate-400 ring-1 ring-slate-200 sm:block">
          <span className="px-2">carmanager.app/dashboard</span>
        </span>
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {[
            ['Vehicles', '3', 'car', 'text-brand-600 bg-brand-50'],
            ['Services', '14', 'wrench', 'text-amber-600 bg-amber-50'],
            ['This year', '₹48,200', 'wallet', 'text-emerald-600 bg-emerald-50'],
          ].map(([label, value, icon, tone]) => (
            <div key={label} className="rounded-xl border border-slate-200/80 p-2.5 sm:p-3">
              <span className={`flex h-6 w-6 items-center justify-center rounded-md ${tone}`}>
                <Icon name={icon} className="h-3.5 w-3.5" />
              </span>
              <p className="mt-2 text-[10px] text-slate-500 sm:text-[11px]">{label}</p>
              <p className="font-display text-sm font-bold tabular-nums text-slate-900 sm:text-lg">{value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-slate-200/80 p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-slate-500">Monthly spend</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
              <Icon name="trendDown" className="h-3 w-3" /> 12% vs last month
            </span>
          </div>
          <SparkArea />
        </div>
        {[
          ['Maruti Suzuki Swift', 'Oil change · 12 Oct', '₹2,450'],
          ['Honda Activa 6G', 'General service · 2 Oct', '₹850'],
        ].map(([name, meta, cost]) => (
          <div key={name} className="flex items-center justify-between rounded-xl border border-slate-200/80 px-3 py-2.5">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-brand-50 text-slate-500">
                <Icon name="car" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{name}</p>
                <p className="text-xs text-slate-500">{meta}</p>
              </div>
            </div>
            <span className="text-sm font-semibold tabular-nums text-slate-900">{cost}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Floating notification cards */}
    <div className="absolute -left-4 top-1/3 hidden animate-float rounded-xl bg-white p-3 shadow-pop ring-1 ring-slate-200/80 sm:block lg:-left-10">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          <Icon name="calendar" />
        </span>
        <div>
          <p className="text-xs font-semibold text-slate-900">Service due in 3 days</p>
          <p className="text-[11px] text-slate-500">Hyundai Creta · Oil change</p>
        </div>
      </div>
    </div>
    <div className="absolute -bottom-5 -right-3 hidden animate-float rounded-xl bg-white p-3 shadow-pop ring-1 ring-slate-200/80 [animation-delay:1.5s] sm:block lg:-right-6">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <Icon name="fuel" />
        </span>
        <div>
          <p className="text-xs font-semibold text-slate-900">18.4 km/L average</p>
          <p className="text-[11px] text-slate-500">Up 6% this month</p>
        </div>
      </div>
    </div>
  </div>
);

const ReminderMock = () => (
  <div className="card p-5">
    <div className="flex items-center justify-between">
      <p className="font-semibold text-slate-900">Upcoming services</p>
      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">3 scheduled</span>
    </div>
    <ul className="mt-4 space-y-2.5">
      {[
        ['Hyundai Creta SX', 'Oil change', 'Overdue', 'bg-red-50 text-red-700 ring-red-200'],
        ['Honda Activa 6G', 'General service', 'in 5 days', 'bg-amber-50 text-amber-800 ring-amber-200'],
        ['Maruti Suzuki Swift', 'Tyre rotation', '26 Nov', 'bg-slate-50 text-slate-700 ring-slate-200'],
      ].map(([car, type, when, tone]) => (
        <li key={car} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 px-3.5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <Icon name="wrench" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{car}</p>
              <p className="text-xs text-slate-500">{type}</p>
            </div>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}>{when}</span>
        </li>
      ))}
    </ul>
  </div>
);

const ReportMock = () => (
  <div className="relative">
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100">
          <Icon name="file" className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold text-slate-900">Service history report</p>
          <p className="text-xs text-slate-500">Maruti Suzuki Swift · 2026</p>
        </div>
      </div>
      <div className="mt-5 space-y-2">
        {['w-full', 'w-11/12', 'w-4/5', 'w-full', 'w-3/4'].map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`h-2 rounded-full bg-slate-100 ${w}`} />
            <div className="h-2 w-12 shrink-0 rounded-full bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="mt-5 flex gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
          <Icon name="download" className="h-3.5 w-3.5" /> PDF
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">
          <Icon name="sheet" className="h-3.5 w-3.5" /> Excel
        </span>
      </div>
    </div>
    <div className="absolute -bottom-6 -right-2 rounded-2xl bg-white p-3 shadow-pop ring-1 ring-slate-200/80 sm:-right-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-slate-50 text-slate-900">
        <Icon name="qr" className="h-14 w-14" strokeWidth={1.5} />
      </div>
      <p className="mt-1 text-center text-[10px] font-semibold text-slate-500">Scan to view</p>
    </div>
  </div>
);

const Check = ({ children, dark = false }) => (
  <li className="flex items-start gap-3">
    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${dark ? 'bg-white/10 text-cyan-300' : 'bg-brand-50 text-brand-600'}`}>
      <Icon name="check" className="h-3 w-3" strokeWidth={2.5} />
    </span>
    <span>{children}</span>
  </li>
);

const Landing = () => (
  <>
    {/* Hero */}
    <section className="relative overflow-hidden bg-ink-950">
      <div className="pointer-events-none absolute inset-0 bg-grid-light [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/30 blur-[120px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-8 lg:pb-32 lg:pt-24">
        <div className="animate-fade-up text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur">
            <span className="rounded-full bg-brand-500 px-1.5 py-px text-[10px] font-bold uppercase tracking-wide text-white">New</span>
            QR vehicle cards &amp; one-click reports
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.6rem]">
            Every vehicle. Every service. <span className="text-gradient">Every rupee.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-400 lg:mx-0">
            Car Manager keeps your cars, bikes and trucks organised: service history, fuel, running costs and
            reminders in one beautiful dashboard. No more spreadsheets.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link to="/register" className="btn btn-primary btn-lg px-6 py-3">
              Create free account <Icon name="arrowRight" />
            </Link>
            <Link to="/login" className="btn btn-lg border border-white/15 bg-white/5 px-6 py-3 text-white backdrop-blur hover:bg-white/10">
              <Icon name="eye" /> Try the live demo
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400 lg:justify-start">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-2">
                <Icon name="checkCircle" className="h-4 w-4 text-cyan-300" /> {h}
              </li>
            ))}
          </ul>
        </div>
        <div className="animate-fade-up [animation-delay:120ms]">
          <ProductPreview />
        </div>
      </div>
    </section>

    {/* Vehicle types strip */}
    <section className="border-b border-slate-200/80 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:px-6 lg:flex-row lg:justify-between lg:px-8">
        <p className="text-sm font-medium text-slate-500">Built for every vehicle you own</p>
        <ul className="flex flex-wrap justify-center gap-2">
          {vehicleTypes.map((t) => (
            <li key={t} className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm font-medium text-slate-600">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>

    {/* Features */}
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Features</p>
        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Everything you need to run your vehicles</h2>
        <p className="mt-4 text-lg text-slate-600">One app replaces the glovebox full of receipts, the notes app and the spreadsheet.</p>
      </div>
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="card card-interactive p-6">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-inset ${f.tone}`}>
              <Icon name={f.icon} className="h-5 w-5" />
            </span>
            <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{f.text}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Spotlights */}
    <section className="border-y border-slate-200/80 bg-white">
      <div className="mx-auto max-w-7xl space-y-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="eyebrow">Reminders</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Never miss a service again</h2>
            <p className="mt-4 text-lg text-slate-600">
              Set the next due date when you log a service and Car Manager keeps track for you, flagging anything
              overdue right on your dashboard.
            </p>
            <ul className="mt-8 space-y-3 text-slate-700">
              <Check>Upcoming and overdue services across all vehicles</Check>
              <Check>Real-time in-app notifications</Check>
              <Check>Complete history with costs and providers</Check>
            </ul>
          </div>
          <ReminderMock />
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="lg:order-2">
            <p className="eyebrow">Reports</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Share-ready reports in one click</h2>
            <p className="mt-4 text-lg text-slate-600">
              Export clean PDF and Excel reports for resale, insurance claims or your accountant, and stick a QR code
              on the windscreen that opens the vehicle&apos;s page.
            </p>
            <ul className="mt-8 space-y-3 text-slate-700">
              <Check>Fleet, service history and monthly summaries</Check>
              <Check>Printable QR vehicle cards</Check>
              <Check>Compare vehicles side by side</Check>
            </ul>
          </div>
          <div className="pb-6 lg:order-1 lg:pr-6">
            <ReportMock />
          </div>
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Up and running in three steps</h2>
      </div>
      <ol className="relative mt-14 grid gap-10 sm:grid-cols-3 sm:gap-6">
        <div className="absolute left-[16.6%] right-[16.6%] top-7 hidden h-px bg-gradient-to-r from-brand-200 via-brand-300 to-brand-200 sm:block" aria-hidden="true" />
        {steps.map((s, i) => (
          <li key={s.title} className="relative text-center">
            <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-card ring-1 ring-slate-200">
              <Icon name={s.icon} className="h-6 w-6" />
              <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white ring-4 ring-[#f6f8fc]">
                {i + 1}
              </span>
            </span>
            <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-600">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>

    {/* FAQ */}
    <section className="border-t border-slate-200/80 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:px-8 lg:py-24">
        <div>
          <p className="eyebrow">FAQ</p>
          <h2 className="mt-3 text-3xl font-bold">Questions, answered</h2>
          <p className="mt-4 text-slate-600">Still curious? Sign in with a demo account and look around.</p>
        </div>
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform group-open:rotate-45">
                  <Icon name="plus" className="h-4 w-4" />
                </span>
              </summary>
              <p className="mt-3 pr-10 text-sm leading-6 text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>

    {/* Final CTA */}
    <section className="bg-white px-4 pb-20 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-ink-950 px-6 py-14 text-center sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-grid-light [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[600px] -translate-x-1/2 rounded-full bg-brand-600/40 blur-[100px]" aria-hidden="true" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold text-white sm:text-4xl">Take control of your vehicles today</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">It takes less than a minute to add your first vehicle.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register" className="btn btn-primary btn-lg px-6 py-3">
              Get started free <Icon name="arrowRight" />
            </Link>
            <Link to="/login" className="btn btn-lg border border-white/15 bg-white/5 px-6 py-3 text-white hover:bg-white/10">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  </>
);

const Home = () => {
  const { isAuthenticated, isAdmin, initializing } = useAuth();
  if (initializing) return <DashboardSkeleton />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return isAuthenticated ? <Dashboard /> : <Landing />;
};

export default Home;
