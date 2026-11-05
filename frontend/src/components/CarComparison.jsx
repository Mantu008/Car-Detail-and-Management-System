import { useEffect, useState } from 'react';
import api from '../config/api';
import { fuelStats } from './FuelTracker';
import { EmptyState, Field, VehicleImage } from './ui';
import { formatCurrency, formatKm, vehicleName } from '../utils/format';

// Load services + fuel for one vehicle.
const useVehicleStats = (car) => {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    if (!car) return setStats(null);
    let cancelled = false;
    Promise.allSettled([api.get(`/api/services/${car._id}`), api.get(`/api/cars/${car._id}/fuel-entries`)]).then(([s, f]) => {
      if (cancelled) return;
      const services = s.status === 'fulfilled' ? s.value.data.data : [];
      const fuel = f.status === 'fulfilled' ? f.value.data.data : [];
      const total = services.reduce((sum, x) => sum + (x.cost || 0), 0);
      setStats({ count: services.length, total, average: services.length ? total / services.length : 0, fuel: fuelStats(fuel) });
    });
    return () => {
      cancelled = true;
    };
  }, [car]);
  return stats;
};

// lower = better for cost-like metrics, higher = better for year.
const ROWS = [
  { label: 'Year', get: (c) => c.year, better: 'high' },
  { label: 'Type', get: (c) => c.type },
  { label: 'Price', get: (c) => c.price, fmt: formatCurrency, better: 'low' },
  { label: 'Odometer', get: (c) => c.mileage, fmt: formatKm, better: 'low' },
  { label: 'Colour', get: (c) => c.color },
  { label: 'Service records', get: (c, s) => s?.count },
  { label: 'Total service spend', get: (c, s) => s?.total, fmt: formatCurrency, better: 'low' },
  { label: 'Average per service', get: (c, s) => s?.average, fmt: formatCurrency, better: 'low' },
  { label: 'Fuel efficiency', get: (c, s) => s?.fuel.efficiency, fmt: (v) => `${v.toFixed(1)} km/L`, better: 'high' },
  { label: 'Running cost', get: (c, s) => s?.fuel.costPerKm, fmt: (v) => `${formatCurrency(v, { precise: true })}/km`, better: 'low' },
];

const winner = (a, b, better) => {
  if (!better || a == null || b == null || a === b) return null;
  return (better === 'high' ? a > b : a < b) ? 0 : 1;
};

const CarComparison = ({ cars }) => {
  const [ids, setIds] = useState(['', '']);
  const selected = ids.map((id) => cars.find((c) => c._id === id) || null);
  const statsA = useVehicleStats(selected[0]);
  const statsB = useVehicleStats(selected[1]);
  const stats = [statsA, statsB];

  if (cars.length < 2) {
    return <EmptyState icon="scale" title="Add at least two vehicles" description="Comparison needs two vehicles in your account." />;
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <Field key={i} label={`Vehicle ${i + 1}`} htmlFor={`cmp-${i}`}>
            <select
              id={`cmp-${i}`}
              className="input"
              value={ids[i]}
              onChange={(e) => setIds((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
            >
              <option value="">Choose a vehicle…</option>
              {cars
                .filter((c) => c._id !== ids[1 - i])
                .map((c) => (
                  <option key={c._id} value={c._id}>
                    {vehicleName(c)} ({c.year})
                  </option>
                ))}
            </select>
          </Field>
        ))}
      </div>

      {selected[0] && selected[1] ? (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="table">
            <thead>
              <tr>
                <th className="w-1/3" />
                {selected.map((c) => (
                  <th key={c._id} className="!normal-case !tracking-normal">
                    <div className="flex items-center gap-3">
                      <VehicleImage src={c.image} alt="" className="h-10 w-14 rounded" iconClass="h-4 w-4" />
                      <span className="text-sm font-semibold text-slate-900">{vehicleName(c)}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ROWS.map((row) => {
                const values = selected.map((c, i) => row.get(c, stats[i]));
                const win = winner(values[0], values[1], row.better);
                return (
                  <tr key={row.label}>
                    <td className="text-slate-500">{row.label}</td>
                    {values.map((v, i) => (
                      <td key={i} className={`tabular-nums ${win === i ? 'font-semibold text-emerald-700' : ''}`}>
                        {v == null || v === '' ? '—' : row.fmt ? row.fmt(v) : v}
                        {win === i && <span className="ml-1.5 text-xs font-normal text-emerald-600">better</span>}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
          Choose two vehicles to compare them side by side.
        </p>
      )}
    </div>
  );
};

export default CarComparison;
