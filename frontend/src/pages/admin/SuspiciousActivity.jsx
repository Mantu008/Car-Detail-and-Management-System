import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../config/api';
import useFetch from '../../hooks/useFetch';
import { Alert, Button, EmptyState, PageHeader, PageLoader, VehicleImage } from '../../components/ui';
import { errorMessage, formatCurrency, formatDateTime, vehicleName } from '../../utils/format';

const SuspiciousActivity = () => {
  const { data: vehicles, loading, error, setData } = useFetch('/api/admin/suspicious-vehicles', { initialData: [] });

  const clearFlag = async (car) => {
    try {
      await api.put(`/api/admin/vehicles/${car._id}/status`, { status: 'normal' });
      setData((prev) => prev.filter((v) => v._id !== car._id));
      toast.success(`${vehicleName(car)} marked as reviewed`);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (loading) return <PageLoader />;

  return (
    <>
      <PageHeader
        title="Flagged vehicles"
        description="Vehicles marked for review. Flag new ones from the Vehicles page."
        actions={<Link to="/admin/vehicles" className="btn btn-secondary">All vehicles</Link>}
      />
      {error && <Alert tone="red" className="mb-6">{error}</Alert>}

      {vehicles.length === 0 ? (
        <div className="card">
          <EmptyState icon="checkCircle" title="Nothing to review" description="No vehicles are currently flagged." />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {vehicles.map((car) => (
            <article key={car._id} className="card flex gap-4 p-4">
              <VehicleImage src={car.image} alt="" className="h-24 w-32 shrink-0 rounded-lg" iconClass="h-6 w-6" />
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate font-semibold">{vehicleName(car)}</p>
                <p className="text-sm text-slate-500">
                  {car.year} · {car.type} · {formatCurrency(car.price)}
                </p>
                <p className="mt-1 truncate text-sm text-slate-600">
                  {car.owner?.name} <span className="text-slate-400">· {car.owner?.email}</span>
                </p>
                <p className="text-xs text-slate-400">Flagged {formatDateTime(car.updatedAt)}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" icon="check" onClick={() => clearFlag(car)}>
                    Mark reviewed
                  </Button>
                  <Link to={`/cars/${car._id}`} className="btn btn-secondary btn-sm">
                    View
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
};

export default SuspiciousActivity;
