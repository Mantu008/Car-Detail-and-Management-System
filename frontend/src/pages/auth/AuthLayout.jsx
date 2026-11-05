import Logo from '../../components/layout/Logo';
import { Icon } from '../../components/ui';

const points = [
  { icon: 'car', title: 'Every vehicle in one place', text: 'Specs, photos, documents and ownership details.' },
  { icon: 'wrench', title: 'Complete service history', text: 'Log repairs and maintenance with costs and due dates.' },
  { icon: 'fuel', title: 'Fuel and running costs', text: 'Track mileage, km/L and cost per kilometre.' },
];

const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="grid min-h-screen lg:grid-cols-[1fr_minmax(0,560px)]">
    <div className="flex flex-col px-6 py-8 sm:px-10">
      <Logo />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-8 text-center text-sm text-slate-500">{footer}</div>}
      </div>
    </div>

    <aside className="relative hidden overflow-hidden bg-slate-900 lg:flex lg:flex-col lg:justify-center lg:px-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />
      <div className="relative">
        <p className="text-sm font-medium text-brand-200">Vehicle Detail &amp; Management System</p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight text-white">
          Know exactly what each vehicle costs you, and what it needs next.
        </h2>
        <ul className="mt-10 space-y-6">
          {points.map((p) => (
            <li key={p.title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                <Icon name={p.icon} className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-white">{p.title}</p>
                <p className="mt-0.5 text-sm text-slate-400">{p.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  </div>
);

export default AuthLayout;
