import Logo from '../../components/layout/Logo';
import { Icon } from '../../components/ui';

const points = [
  { icon: 'car', title: 'Every vehicle in one place', text: 'Specs, photos, documents and ownership details.' },
  { icon: 'wrench', title: 'Complete service history', text: 'Log repairs and maintenance with costs and due dates.' },
  { icon: 'fuel', title: 'Fuel and running costs', text: 'Track mileage, km/L and cost per kilometre.' },
];

const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="grid min-h-screen bg-white lg:grid-cols-[1fr_minmax(0,600px)]">
    <div className="flex flex-col px-6 py-8 sm:px-10">
      <Logo />
      <div className="mx-auto flex w-full max-w-sm flex-1 animate-fade-up flex-col justify-center py-12">
        <h1 className="text-[1.75rem] font-bold">{title}</h1>
        {subtitle && <p className="mt-2 text-[15px] text-slate-500">{subtitle}</p>}
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-8 text-center text-sm text-slate-500">{footer}</div>}
      </div>
      <p className="text-center text-xs text-slate-400 lg:text-left">© {new Date().getFullYear()} Car Manager</p>
    </div>

    <aside className="relative m-3 hidden overflow-hidden rounded-3xl bg-ink-950 lg:flex lg:flex-col lg:justify-center lg:px-14">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-light [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_top_right,black_20%,transparent_70%)]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-600/40 blur-[100px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" aria-hidden="true" />

      <div className="relative">
        <p className="eyebrow text-brand-300">Vehicle Detail &amp; Management System</p>
        <h2 className="mt-4 text-[2rem] font-bold leading-tight text-white">
          Know exactly what each vehicle costs you, and <span className="text-gradient">what it needs next.</span>
        </h2>
        <ul className="mt-10 space-y-6">
          {points.map((p) => (
            <li key={p.title} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-cyan-300 ring-1 ring-inset ring-white/10">
                <Icon name={p.icon} className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-white">{p.title}</p>
                <p className="mt-0.5 text-sm text-slate-400">{p.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-12 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-inset ring-white/10 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/15 text-amber-300">
              <Icon name="calendar" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Service due in 3 days</p>
              <p className="text-xs text-slate-400">Hyundai Creta · Oil change</p>
            </div>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-slate-200">Reminder</span>
          </div>
        </div>
      </div>
    </aside>
  </div>
);

export default AuthLayout;
