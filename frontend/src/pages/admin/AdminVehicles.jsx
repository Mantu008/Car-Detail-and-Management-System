import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../config/api';
import useFetch from '../../hooks/useFetch';
import { useConfirm } from '../../context/confirmContext';
import { Alert, Badge, EmptyState, Icon, PageHeader, PageLoader, SearchInput, VehicleImage } from '../../components/ui';
import { errorMessage, formatCurrency, formatDate, formatKm, vehicleName } from '../../utils/format';

const AdminVehicles = () => {
  const { data: cars, loading, error, setData } = useFetch('/api/cars', { initialData: [] });
  const confirm = useConfirm();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cars.filter(
      (c) =>
        (!type || c.type === type) &&
        (!status || c.status === status) &&
        (!q || [c.brand, c.model, c.owner?.name, c.owner?.email, String(c.year)].some((v) => v?.toLowerCase().includes(q)))
    );
  }, [cars, search, type, status]);

  const toggleFlag = async (car) => {
    const next = car.status === 'suspicious' ? 'normal' : 'suspicious';
    if (next === 'suspicious') {
      const ok = await confirm({
        title: `Flag ${vehicleName(car)}?`,
        message: `The owner (${car.owner?.name}) will be notified that this vehicle is under review.`,
        confirmText: 'Flag vehicle',
        tone: 'danger',
      });
      if (!ok) return;
    }
    try {
      await api.put(`/api/admin/vehicles/${car._id}/status`, { status: next });
      setData((prev) => prev.map((c) => (c._id === car._id ? { ...c, status: next } : c)));
      toast.success(next === 'suspicious' ? 'Vehicle flagged' : 'Flag cleared');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (loading) return <PageLoader />;

  const types = [...new Set(cars.map((c) => c.type))].sort();

  return (
    <>
      <PageHeader title="Vehicles" description={`${cars.length} vehicles registered across all users.`} />
      {error && <Alert tone="red" className="mb-6">{error}</Alert>}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={setSearch} placeholder="Search vehicle or owner…" className="sm:max-w-sm sm:flex-1" />
        <select className="input sm:w-40" value={type} onChange={(e) => setType(e.target.value)} aria-label="Type">
          <option value="">All types</option>
          {types.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select className="input sm:w-40" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">Any status</option>
          <option value="normal">Normal</option>
          <option value="suspicious">Flagged</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {visible.length === 0 ? (
          <EmptyState icon="car" title={cars.length ? 'No matching vehicles' : 'No vehicles yet'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Owner</th>
                  <th className="!text-right">Price</th>
                  <th className="!text-right">Odometer</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((car) => (
                  <tr key={car._id}>
                    <td>
                      <Link to={`/cars/${car._id}`} className="flex items-center gap-3">
                        <VehicleImage src={car.image} alt="" className="h-10 w-14 rounded" iconClass="h-4 w-4" />
                        <div>
                          <p className="font-medium text-slate-900 hover:underline">{vehicleName(car)}</p>
                          <p className="text-xs text-slate-500">
                            {car.year} · {car.type}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td>
                      <p className="text-slate-900">{car.owner?.name || '—'}</p>
                      <p className="text-xs text-slate-500">{car.owner?.email}</p>
                    </td>
                    <td className="text-right tabular-nums">{formatCurrency(car.price)}</td>
                    <td className="whitespace-nowrap text-right tabular-nums">{formatKm(car.mileage)}</td>
                    <td>
                      {car.status === 'suspicious' ? <Badge tone="red" dot>Flagged</Badge> : <Badge tone="green" dot>Normal</Badge>}
                    </td>
                    <td className="whitespace-nowrap">{formatDate(car.createdAt)}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        className={`btn btn-sm ${car.status === 'suspicious' ? 'btn-secondary' : 'btn-danger-ghost'}`}
                        onClick={() => toggleFlag(car)}
                      >
                        <Icon name="flag" /> {car.status === 'suspicious' ? 'Clear flag' : 'Flag'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="mt-3 text-sm text-slate-500">
        Showing {visible.length} of {cars.length}
      </p>
    </>
  );
};

export default AdminVehicles;
