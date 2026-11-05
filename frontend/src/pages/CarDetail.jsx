import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../config/api';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/authContext';
import { useConfirm } from '../context/confirmContext';
import CarQRCode from '../components/CarQRCode';
import FuelTracker from '../components/FuelTracker';
import ServiceCostEstimator from '../components/ServiceCostEstimator';
import ServiceHistory from '../components/car/ServiceHistory';
import { Alert, Badge, Button, EmptyState, Icon, PageLoader, Tabs, VehicleImage } from '../components/ui';
import { errorMessage, formatCurrency, formatDate, formatKm, vehicleName } from '../utils/format';

const Spec = ({ label, children }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm text-slate-500">{label}</dt>
    <dd className="mt-0.5 text-sm font-medium text-slate-900 sm:col-span-2 sm:mt-0">{children || '—'}</dd>
  </div>
);

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { isAuthenticated, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';
  const [showQR, setShowQR] = useState(false);

  // Re-fetch when auth changes so owners see their full record.
  const { data: car, loading, error, setData: setCar } = useFetch(`/api/cars/${id}`, { params: { auth: isAuthenticated } });
  const canManage = !!car?.canManage;
  const services = useFetch(canManage ? `/api/services/${id}` : null, { initialData: [] });

  useEffect(() => {
    if (car && !canManage && tab !== 'overview') setSearchParams({}, { replace: true });
  }, [car, canManage, tab, setSearchParams]);

  const setTab = (value) => setSearchParams(value === 'overview' ? {} : { tab: value }, { replace: true });

  const handleDelete = async () => {
    const ok = await confirm({
      title: `Delete ${vehicleName(car)}?`,
      message: 'The vehicle, its service history and fuel log will be permanently removed.',
      confirmText: 'Delete vehicle',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/api/cars/${id}`);
      toast.success('Vehicle deleted');
      navigate(isAdmin ? '/admin/vehicles' : '/my-cars');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete the vehicle'));
    }
  };

  const toggleFlag = async () => {
    const next = car.status === 'suspicious' ? 'normal' : 'suspicious';
    try {
      await api.put(`/api/admin/vehicles/${id}/status`, { status: next });
      setCar({ ...car, status: next });
      toast.success(next === 'suspicious' ? 'Vehicle flagged for review' : 'Flag cleared');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (loading) return <PageLoader />;

  if (error || !car) {
    return (
      <div className="page">
        <div className="card">
          <EmptyState
            icon="car"
            title="Vehicle not found"
            description="It may have been deleted, or the link is incorrect."
            action={
              <Link to={isAuthenticated ? '/my-cars' : '/'} className="btn btn-secondary">
                Go back
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const serviceList = services.data || [];
  const totalServiceCost = serviceList.reduce((s, x) => s + (x.cost || 0), 0);
  const lastService = serviceList[0];

  return (
    <div className="page">
      {isAuthenticated && (
        <Link to={isAdmin ? '/admin/vehicles' : '/my-cars'} className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
          <Icon name="arrowLeft" /> {isAdmin ? 'All vehicles' : 'My vehicles'}
        </Link>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold sm:text-[1.75rem]">{vehicleName(car)}</h1>
            <Badge>{car.type}</Badge>
            {car.status === 'suspicious' && (
              <Badge tone="red" dot>
                Flagged
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {car.year}
            {car.color && ` · ${car.color}`} · Owned by {car.owner?.name || 'Unknown'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon="qr" onClick={() => setShowQR(true)}>
            QR code
          </Button>
          {canManage && (
            <>
              <Link to={`/cars/${id}/edit`} className="btn btn-secondary">
                <Icon name="edit" /> Edit
              </Link>
              {isAdmin && (
                <Button variant="secondary" icon="flag" onClick={toggleFlag}>
                  {car.status === 'suspicious' ? 'Clear flag' : 'Flag'}
                </Button>
              )}
              <Button variant="danger-ghost" icon="trash" onClick={handleDelete} aria-label="Delete vehicle">
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {car.status === 'suspicious' && canManage && !isAdmin && (
        <Alert tone="amber" className="mb-6" title="This vehicle has been flagged for review">
          An administrator has marked this vehicle for review. If you believe this is a mistake,{' '}
          <Link to="/support" className="underline">
            contact support
          </Link>
          .
        </Alert>
      )}

      {canManage && (
        <div className="mb-6">
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'overview', label: 'Overview', icon: 'car' },
              { value: 'services', label: 'Service history', icon: 'wrench', count: serviceList.length },
              { value: 'fuel', label: 'Fuel log', icon: 'fuel' },
              { value: 'costs', label: 'Cost insights', icon: 'calculator' },
            ]}
          />
        </div>
      )}

      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="card overflow-hidden">
              <VehicleImage src={car.image} alt={vehicleName(car)} className="aspect-[16/9] w-full" iconClass="h-16 w-16" />
            </div>
            {car.description && (
              <div className="card mt-6 p-5">
                <h2 className="text-sm font-semibold">Notes</h2>
                <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{car.description}</p>
              </div>
            )}
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="card px-5">
              <dl className="divide-y divide-slate-100">
                <Spec label="Price">{formatCurrency(car.price)}</Spec>
                <Spec label="Year">{car.year}</Spec>
                <Spec label="Type">{car.type}</Spec>
                <Spec label="Colour">{car.color}</Spec>
                <Spec label="Odometer">{car.mileage != null ? formatKm(car.mileage) : null}</Spec>
                <Spec label="Added">{formatDate(car.createdAt)}</Spec>
              </dl>
            </div>

            <div className="card p-5">
              <h2 className="text-sm font-semibold">Owner</h2>
              <p className="mt-2 text-sm font-medium">{car.owner?.name || 'Unknown'}</p>
              {car.owner?.email && <p className="text-sm text-slate-500">{car.owner.email}</p>}
            </div>

            {canManage ? (
              <div className="card p-5">
                <h2 className="text-sm font-semibold">Service summary</h2>
                <dl className="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs text-slate-500">Total spent</dt>
                    <dd className="mt-0.5 font-semibold tabular-nums">{formatCurrency(totalServiceCost)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Last service</dt>
                    <dd className="mt-0.5 font-semibold">{lastService ? formatDate(lastService.date) : '—'}</dd>
                  </div>
                </dl>
                <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => setTab('services')}>
                  View service history
                </Button>
              </div>
            ) : (
              !isAuthenticated && (
                <Alert tone="blue" title="Are you the owner?">
                  <Link to="/login" state={{ from: `/cars/${id}` }} className="underline">
                    Sign in
                  </Link>{' '}
                  to see the full service history and fuel log.
                </Alert>
              )
            )}
          </div>
        </div>
      )}

      {canManage && tab === 'services' && (
        services.loading ? <PageLoader className="py-16" /> : <ServiceHistory carId={id} services={serviceList} setServices={services.setData} />
      )}
      {canManage && tab === 'fuel' && <FuelTracker car={car} />}
      {canManage && tab === 'costs' && (services.loading ? <PageLoader className="py-16" /> : <ServiceCostEstimator services={serviceList} />)}

      {showQR && <CarQRCode car={car} onClose={() => setShowQR(false)} />}
    </div>
  );
};

export default CarDetail;
