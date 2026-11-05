import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useNotifications } from '../context/notificationContext';
import useFetch from '../hooks/useFetch';
import { Alert, Badge, EmptyState, Icon, PageHeader, PageLoader, StatCard, VehicleImage, statusTone } from '../components/ui';
import { capitalize, formatCurrency, formatDate, formatKm, vehicleName } from '../utils/format';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const Dashboard = () => {
  const { user } = useAuth();
  const { announcements } = useNotifications();
  const cars = useFetch('/api/cars/my-cars', { initialData: [] });
  const services = useFetch('/api/services', { initialData: [] });

  const stats = useMemo(() => {
    const list = services.data || [];
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const now = new Date();
    const upcoming = list
      .filter((s) => s.nextServiceDate)
      .map((s) => ({ ...s, due: new Date(s.nextServiceDate) }))
      // Only keep the latest reminder per vehicle + type.
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .filter((s, i, arr) => arr.findIndex((x) => x.car?._id === s.car?._id && x.serviceType === s.serviceType) === i)
      .sort((a, b) => a.due - b.due)
      .slice(0, 5);

    return {
      total: list.reduce((sum, s) => sum + (s.cost || 0), 0),
      thisYear: list.filter((s) => new Date(s.date) >= yearStart).reduce((sum, s) => sum + (s.cost || 0), 0),
      upcoming,
      overdue: upcoming.filter((s) => s.due < now).length,
      recent: list.slice(0, 5),
    };
  }, [services.data]);

  if (cars.loading || services.loading) return <PageLoader />;

  const vehicles = cars.data || [];
  const flagged = vehicles.filter((c) => c.status === 'suspicious');

  return (
    <div className="page">
      <PageHeader
        title={`${greeting()}, ${user.name.split(' ')[0]}`}
        description="Here's an overview of your vehicles and recent activity."
        actions={
          <Link to="/cars/new" className="btn btn-primary">
            <Icon name="plus" /> Add vehicle
          </Link>
        }
      />

      {(cars.error || services.error) && (
        <Alert tone="red" className="mb-6">
          {cars.error || services.error}
        </Alert>
      )}

      {flagged.length > 0 && (
        <Alert tone="amber" title="A vehicle needs attention" className="mb-6">
          {flagged.map(vehicleName).join(', ')} {flagged.length === 1 ? 'has' : 'have'} been flagged for review by an
          administrator. Contact <Link to="/support" className="underline">support</Link> if you think this is a mistake.
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Vehicles" value={vehicles.length} icon="car" tone="blue" />
        <StatCard label="Service records" value={services.data.length} icon="wrench" />
        <StatCard label="Spent this year" value={formatCurrency(stats.thisYear)} icon="wallet" tone="green" />
        <StatCard
          label="Upcoming services"
          value={stats.upcoming.length}
          hint={stats.overdue ? `${stats.overdue} overdue` : 'None overdue'}
          icon="calendar"
          tone={stats.overdue ? 'red' : 'amber'}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <div className="card-header">
            <h2 className="card-title">Your vehicles</h2>
            <Link to="/my-cars" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              View all
            </Link>
          </div>
          {vehicles.length === 0 ? (
            <EmptyState
              icon="car"
              title="No vehicles yet"
              description="Add your first vehicle to start tracking services and costs."
              action={
                <Link to="/cars/new" className="btn btn-primary">
                  <Icon name="plus" /> Add vehicle
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {vehicles.slice(0, 5).map((car) => (
                <li key={car._id}>
                  <Link to={`/cars/${car._id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50">
                    <VehicleImage src={car.image} alt={vehicleName(car)} className="h-12 w-16 rounded-md" iconClass="h-5 w-5" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{vehicleName(car)}</p>
                      <p className="text-sm text-slate-500">
                        {car.year} · {car.type} · {formatKm(car.mileage)}
                      </p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-sm font-medium tabular-nums">{formatCurrency(car.price)}</p>
                      <p className="text-xs text-slate-500">{car.services?.length || 0} service{car.services?.length === 1 ? '' : 's'}</p>
                    </div>
                    <Icon name="chevronRight" className="h-4 w-4 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Upcoming services</h2>
          </div>
          {stats.upcoming.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="Nothing scheduled"
              description='Set a "next service date" when you log a service to get reminders here.'
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.upcoming.map((s) => {
                const overdue = s.due < new Date();
                return (
                  <li key={s._id}>
                    <Link to={`/cars/${s.car?._id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{vehicleName(s.car)}</p>
                        <p className="text-xs text-slate-500">{capitalize(s.serviceType)}</p>
                      </div>
                      <Badge tone={overdue ? 'red' : 'amber'}>{overdue ? 'Overdue' : formatDate(s.due)}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card lg:col-span-2">
          <div className="card-header">
            <h2 className="card-title">Recent services</h2>
            <Link to="/analytics" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Analytics
            </Link>
          </div>
          {stats.recent.length === 0 ? (
            <EmptyState icon="wrench" title="No services logged" description="Open a vehicle and add its first service record." />
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th className="!text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recent.map((s) => (
                    <tr key={s._id}>
                      <td className="font-medium text-slate-900">
                        <Link to={`/cars/${s.car?._id}`} className="hover:underline">
                          {vehicleName(s.car)}
                        </Link>
                      </td>
                      <td>
                        <Badge tone={statusTone(s.serviceType)}>{s.serviceType}</Badge>
                      </td>
                      <td className="whitespace-nowrap">{formatDate(s.date)}</td>
                      <td className="text-right tabular-nums">{formatCurrency(s.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Announcements</h2>
            <Link to="/notifications" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              All
            </Link>
          </div>
          {announcements.length === 0 ? (
            <EmptyState icon="megaphone" title="No announcements" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {announcements.slice(0, 3).map((a) => (
                <li key={a._id} className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <Badge tone={statusTone(a.type)} dot>
                      {a.type}
                    </Badge>
                    <span className="text-xs text-slate-500">{formatDate(a.createdAt)}</span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium">{a.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{a.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
