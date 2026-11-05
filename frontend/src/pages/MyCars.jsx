import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../config/api';
import useFetch from '../hooks/useFetch';
import { useConfirm } from '../context/confirmContext';
import CarCard from '../components/CarCard';
import CarQRCode from '../components/CarQRCode';
import { Alert, Button, EmptyState, Icon, PageHeader, PageLoader, SearchInput } from '../components/ui';
import { errorMessage, formatCurrency, vehicleName } from '../utils/format';

const TYPES = ['Car', 'Motorbike', 'Truck', 'Auto', 'Other'];

const MyCars = () => {
  const { data: cars, loading, error, reload, setData } = useFetch('/api/cars/my-cars', { initialData: [] });
  const confirm = useConfirm();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('newest');
  const [qrCar, setQrCar] = useState(null);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = cars.filter(
      (c) =>
        (!type || c.type === type) &&
        (!q || [c.brand, c.model, c.color, String(c.year)].some((v) => v?.toLowerCase().includes(q)))
    );
    const sorters = {
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      year: (a, b) => b.year - a.year,
      price: (a, b) => b.price - a.price,
      name: (a, b) => vehicleName(a).localeCompare(vehicleName(b)),
    };
    return [...list].sort(sorters[sort]);
  }, [cars, search, type, sort]);

  const handleDelete = async (car) => {
    const ok = await confirm({
      title: `Delete ${vehicleName(car)}?`,
      message: 'This permanently removes the vehicle together with its service history and fuel log.',
      confirmText: 'Delete vehicle',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/api/cars/${car._id}`);
      setData((prev) => prev.filter((c) => c._id !== car._id));
      toast.success('Vehicle deleted');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete the vehicle'));
    }
  };

  if (loading) return <PageLoader />;

  const totalValue = cars.reduce((sum, c) => sum + (c.price || 0), 0);
  const filtering = search || type;

  return (
    <div className="page">
      <PageHeader
        title="My vehicles"
        description={
          cars.length
            ? `${cars.length} vehicle${cars.length === 1 ? '' : 's'} · total value ${formatCurrency(totalValue)}`
            : 'Add vehicles to track their services, fuel and costs.'
        }
        actions={
          <Link to="/cars/new" className="btn btn-primary">
            <Icon name="plus" /> Add vehicle
          </Link>
        }
      />

      {error && (
        <Alert tone="red" className="mb-6">
          {error}{' '}
          <button type="button" className="underline" onClick={reload}>
            Try again
          </button>
        </Alert>
      )}

      {cars.length > 0 && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <SearchInput value={search} onChange={setSearch} placeholder="Search brand, model, colour, year…" className="sm:max-w-xs sm:flex-1" />
          <select className="input sm:w-40" value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type">
            <option value="">All types</option>
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select className="input sm:ml-auto sm:w-44" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
            <option value="newest">Recently added</option>
            <option value="name">Name (A–Z)</option>
            <option value="year">Year (newest)</option>
            <option value="price">Price (highest)</option>
          </select>
        </div>
      )}

      {cars.length === 0 && !error ? (
        <div className="card">
          <EmptyState
            icon="car"
            title="No vehicles yet"
            description="Add your first vehicle to start keeping its records in one place."
            action={
              <Link to="/cars/new" className="btn btn-primary">
                <Icon name="plus" /> Add your first vehicle
              </Link>
            }
          />
        </div>
      ) : visible.length === 0 && filtering ? (
        <div className="card">
          <EmptyState
            icon="search"
            title="No matching vehicles"
            description="Try a different search or filter."
            action={
              <Button variant="secondary" onClick={() => { setSearch(''); setType(''); }}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((car) => (
            <CarCard key={car._id} car={car} onDelete={handleDelete} onShowQR={setQrCar} />
          ))}
        </div>
      )}

      {qrCar && <CarQRCode car={qrCar} onClose={() => setQrCar(null)} />}
    </div>
  );
};

export default MyCars;
