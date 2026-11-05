import { Link } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { PALETTE, barOptions, doughnutOptions } from '../../lib/chart';
import useFetch from '../../hooks/useFetch';
import { Alert, Button, EmptyState, PageHeader, PageLoader, StatCard } from '../../components/ui';
import { formatCurrency, formatCurrencyCompact } from '../../utils/format';

const Panel = ({ title, subtitle, children, className = '' }) => (
  <section className={`card ${className}`}>
    <div className="card-header">
      <div>
        <h2 className="card-title">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
    <div className="card-body">
      <div className="h-64">{children}</div>
    </div>
  </section>
);

const AdminDashboard = () => {
  const { data: stats, loading, error, reload } = useFetch('/api/admin/dashboard');

  if (loading) return <PageLoader />;
  if (error || !stats) {
    return (
      <Alert tone="red" title="Could not load dashboard">
        {error}{' '}
        <button type="button" className="underline" onClick={reload}>
          Retry
        </button>
      </Alert>
    );
  }

  const { counts, userStatus, vehicleTypes, monthlySignups, monthlyServices } = stats;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="System-wide activity over the last six months."
        actions={<Button variant="secondary" icon="refresh" onClick={reload}>Refresh</Button>}
      />

      {(counts.flaggedCars > 0 || counts.openTickets > 0) && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {counts.flaggedCars > 0 && (
            <Alert tone="amber" title={`${counts.flaggedCars} vehicle${counts.flaggedCars === 1 ? '' : 's'} flagged`}>
              <Link to="/admin/suspicious" className="underline">Review flagged vehicles</Link>
            </Alert>
          )}
          {counts.openTickets > 0 && (
            <Alert tone="blue" title={`${counts.openTickets} open support ticket${counts.openTickets === 1 ? '' : 's'}`}>
              <Link to="/admin/support" className="underline">Go to support</Link>
            </Alert>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Users" value={counts.users} hint={`${userStatus.blocked} blocked`} icon="users" tone="blue" />
        <StatCard label="Vehicles" value={counts.cars} hint={`${counts.flaggedCars} flagged`} icon="car" />
        <StatCard label="Service records" value={counts.services} icon="wrench" tone="amber" />
        <StatCard label="Total service spend" value={formatCurrencyCompact(counts.serviceSpend)} hint={formatCurrency(counts.serviceSpend)} icon="wallet" tone="green" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Service activity" subtitle="Records logged per month" className="lg:col-span-2">
          <Bar
            data={{
              labels: monthlyServices.map((m) => m.label),
              datasets: [{ label: 'Services', data: monthlyServices.map((m) => m.count), backgroundColor: PALETTE[0], borderRadius: 4, maxBarThickness: 40 }],
            }}
            options={barOptions()}
          />
        </Panel>

        <Panel title="Vehicle types">
          {vehicleTypes.length ? (
            <Doughnut
              data={{
                labels: vehicleTypes.map((t) => t.type),
                datasets: [{ data: vehicleTypes.map((t) => t.count), backgroundColor: PALETTE, borderWidth: 0 }],
              }}
              options={doughnutOptions}
            />
          ) : (
            <EmptyState icon="car" title="No vehicles yet" />
          )}
        </Panel>

        <Panel title="Service spend" subtitle="Total cost of services per month" className="lg:col-span-2">
          <Bar
            data={{
              labels: monthlyServices.map((m) => m.label),
              datasets: [{ data: monthlyServices.map((m) => m.revenue), backgroundColor: PALETTE[1], borderRadius: 4, maxBarThickness: 40 }],
            }}
            options={barOptions({ currency: true })}
          />
        </Panel>

        <Panel title="New users" subtitle="Sign-ups per month">
          <Line
            data={{
              labels: monthlySignups.map((m) => m.label),
              datasets: [
                {
                  data: monthlySignups.map((m) => m.count),
                  borderColor: PALETTE[0],
                  backgroundColor: 'rgba(37, 99, 235, 0.08)',
                  fill: true,
                  tension: 0.3,
                  pointRadius: 3,
                },
              ],
            }}
            options={barOptions()}
          />
        </Panel>
      </div>
    </>
  );
};

export default AdminDashboard;
