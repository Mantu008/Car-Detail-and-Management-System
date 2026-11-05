import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import { PALETTE, barOptions, doughnutOptions } from '../../lib/chart';
import useFetch from '../../hooks/useFetch';
import { Alert, EmptyState, Icon, PageHeader, PageLoader, StatCard } from '../../components/ui';
import { capitalize, formatCurrency, vehicleName } from '../../utils/format';

const RANGES = [
  { value: 6, label: 'Last 6 months' },
  { value: 12, label: 'Last 12 months' },
  { value: 24, label: 'Last 24 months' },
];

const ChartCard = ({ title, subtitle, children, empty }) => (
  <section className="card">
    <div className="card-header">
      <div>
        <h2 className="card-title">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
    <div className="card-body">{empty ? <EmptyState icon="chart" title="No data for this period" className="!py-8" /> : <div className="h-72">{children}</div>}</div>
  </section>
);

const UserAnalytics = () => {
  const cars = useFetch('/api/cars/my-cars', { initialData: [] });
  const services = useFetch('/api/services', { initialData: [] });
  const [months, setMonths] = useState(12);

  const stats = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
    const inRange = services.data.filter((s) => new Date(s.date) >= start);

    const monthly = Array.from({ length: months }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en-IN', { month: 'short', year: '2-digit' }), total: 0 };
    });
    const byVehicle = {};
    const byType = {};
    inRange.forEach((s) => {
      const d = new Date(s.date);
      const bucket = monthly.find((m) => m.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (bucket) bucket.total += s.cost || 0;
      const name = vehicleName(s.car);
      byVehicle[name] = (byVehicle[name] || 0) + (s.cost || 0);
      byType[s.serviceType] = (byType[s.serviceType] || 0) + (s.cost || 0);
    });

    const total = inRange.reduce((sum, s) => sum + (s.cost || 0), 0);
    const vehiclesSorted = Object.entries(byVehicle).sort((a, b) => b[1] - a[1]);
    return {
      total,
      count: inRange.length,
      average: inRange.length ? total / inRange.length : 0,
      perMonth: total / months,
      monthly,
      vehicles: vehiclesSorted,
      types: Object.entries(byType).sort((a, b) => b[1] - a[1]),
      top: vehiclesSorted[0],
    };
  }, [services.data, months]);

  if (cars.loading || services.loading) return <PageLoader />;

  if (!cars.data.length && !services.error) {
    return (
      <div className="page">
        <PageHeader title="Analytics" />
        <div className="card">
          <EmptyState
            icon="chart"
            title="Nothing to analyse yet"
            description="Add a vehicle and log a few services to see spending trends here."
            action={
              <Link to="/cars/new" className="btn btn-primary">
                <Icon name="plus" /> Add vehicle
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="Analytics"
        description="Where your maintenance money goes."
        actions={
          <select className="input w-44" value={months} onChange={(e) => setMonths(Number(e.target.value))} aria-label="Date range">
            {RANGES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        }
      />

      {services.error && (
        <Alert tone="red" className="mb-6">
          {services.error}
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total spent" value={formatCurrency(stats.total)} icon="wallet" tone="green" />
        <StatCard label="Monthly average" value={formatCurrency(stats.perMonth)} icon="calendar" tone="blue" />
        <StatCard label="Services" value={stats.count} hint={`${formatCurrency(stats.average)} average`} icon="wrench" />
        <StatCard label="Highest-cost vehicle" value={stats.top ? formatCurrency(stats.top[1]) : '—'} hint={stats.top?.[0]} icon="car" tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Monthly spend" subtitle="Service costs per month" empty={!stats.total}>
            <Bar
              data={{
                labels: stats.monthly.map((m) => m.label),
                datasets: [{ data: stats.monthly.map((m) => m.total), backgroundColor: PALETTE[0], borderRadius: 4, maxBarThickness: 36 }],
              }}
              options={barOptions({ currency: true })}
            />
          </ChartCard>
        </div>
        <ChartCard title="By service type" empty={!stats.types.length}>
          <Doughnut
            data={{
              labels: stats.types.map(([t]) => capitalize(t)),
              datasets: [{ data: stats.types.map(([, v]) => v), backgroundColor: PALETTE, borderWidth: 0 }],
            }}
            options={{
              ...doughnutOptions,
              plugins: { ...doughnutOptions.plugins, tooltip: { callbacks: { label: (c) => ` ${c.label}: ${formatCurrency(c.parsed)}` } } },
            }}
          />
        </ChartCard>
        <div className="lg:col-span-3">
          <ChartCard title="By vehicle" subtitle="Total service spend in the selected period" empty={!stats.vehicles.length}>
            <Bar
              data={{
                labels: stats.vehicles.map(([n]) => n),
                datasets: [{ data: stats.vehicles.map(([, v]) => v), backgroundColor: PALETTE[1], borderRadius: 4, maxBarThickness: 28 }],
              }}
              options={barOptions({ currency: true, horizontal: true })}
            />
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;
