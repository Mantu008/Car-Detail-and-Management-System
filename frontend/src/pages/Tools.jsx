import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useFetch from '../hooks/useFetch';
import CarComparison from '../components/CarComparison';
import { Alert, Button, Field, Icon, PageHeader, PageLoader } from '../components/ui';
import { REPORT_TYPES, buildReport, downloadExcel, downloadPdf } from '../utils/reports';
import { vehicleName } from '../utils/format';

const ReportRow = ({ type, cars, services }) => {
  const [carId, setCarId] = useState('');
  const [busy, setBusy] = useState(null);
  const info = REPORT_TYPES[type];
  const needsCar = type === 'service-history';

  const run = async (format) => {
    if (needsCar && !carId) return toast.info('Choose a vehicle first');
    setBusy(format);
    try {
      const report = buildReport(type, { cars, services, carId });
      await (format === 'pdf' ? downloadPdf(report) : downloadExcel(report));
    } catch (err) {
      console.error(err);
      toast.error('Could not generate the report');
    } finally {
      setBusy(null);
    }
    return undefined;
  };

  return (
    <li className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{info.title}</p>
        <p className="text-sm text-slate-500">{info.description}</p>
      </div>
      {needsCar && (
        <select className="input lg:w-56" value={carId} onChange={(e) => setCarId(e.target.value)} aria-label="Vehicle">
          <option value="">Choose vehicle…</option>
          {cars.map((c) => (
            <option key={c._id} value={c._id}>
              {vehicleName(c)} ({c.year})
            </option>
          ))}
        </select>
      )}
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" icon="file" loading={busy === 'pdf'} disabled={!!busy} onClick={() => run('pdf')}>
          PDF
        </Button>
        <Button variant="secondary" size="sm" icon="sheet" loading={busy === 'xlsx'} disabled={!!busy} onClick={() => run('xlsx')}>
          Excel
        </Button>
      </div>
    </li>
  );
};

const Tools = () => {
  const navigate = useNavigate();
  const cars = useFetch('/api/cars/my-cars', { initialData: [] });
  const services = useFetch('/api/services', { initialData: [] });
  const [toolCar, setToolCar] = useState('');

  if (cars.loading || services.loading) return <PageLoader />;

  return (
    <div className="page">
      <PageHeader title="Tools" description="Reports, comparisons and per-vehicle calculators." />

      {(cars.error || services.error) && (
        <Alert tone="red" className="mb-6">
          {cars.error || services.error}
        </Alert>
      )}

      <div className="space-y-6">
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Reports</h2>
              <p className="mt-0.5 text-sm text-slate-500">Download your data as PDF or Excel.</p>
            </div>
          </div>
          <ul className="divide-y divide-slate-100">
            {Object.keys(REPORT_TYPES).map((type) => (
              <ReportRow key={type} type={type} cars={cars.data} services={services.data} />
            ))}
          </ul>
        </section>

        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Compare vehicles</h2>
              <p className="mt-0.5 text-sm text-slate-500">Price, running costs and service spend side by side.</p>
            </div>
          </div>
          <div className="card-body">
            <CarComparison cars={cars.data} />
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Fuel tracker &amp; cost insights</h2>
              <p className="mt-0.5 text-sm text-slate-500">These live on each vehicle's page. Pick one to jump straight there.</p>
            </div>
          </div>
          <div className="card-body flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field label="Vehicle" htmlFor="tool-car" className="sm:w-72">
              <select id="tool-car" className="input" value={toolCar} onChange={(e) => setToolCar(e.target.value)}>
                <option value="">Choose a vehicle…</option>
                {cars.data.map((c) => (
                  <option key={c._id} value={c._id}>
                    {vehicleName(c)} ({c.year})
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex gap-2">
              <Button variant="secondary" icon="fuel" disabled={!toolCar} onClick={() => navigate(`/cars/${toolCar}?tab=fuel`)}>
                Fuel log
              </Button>
              <Button variant="secondary" icon="calculator" disabled={!toolCar} onClick={() => navigate(`/cars/${toolCar}?tab=costs`)}>
                Cost insights
              </Button>
            </div>
          </div>
          {cars.data.length === 0 && (
            <p className="flex items-center gap-2 border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
              <Icon name="info" /> Add a vehicle first to use these tools.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Tools;
