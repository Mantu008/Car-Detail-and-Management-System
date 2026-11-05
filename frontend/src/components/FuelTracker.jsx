import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';
import useFetch from '../hooks/useFetch';
import { useConfirm } from '../context/confirmContext';
import { Alert, Button, EmptyState, Field, Icon, Modal, PageLoader, StatCard } from './ui';
import { errorMessage, formatCurrency, formatDate, formatNumber, toDateInput } from '../utils/format';

const FUEL_TYPES = [
  ['petrol', 'Petrol'],
  ['diesel', 'Diesel'],
  ['cng', 'CNG'],
  ['electric', 'Electric (kWh)'],
];

/**
 * Efficiency uses the "full tank" method: the fuel bought at a fill-up
 * covers the distance driven since the previous fill-up.
 */
export const fuelStats = (entries) => {
  const sorted = [...entries].sort((a, b) => a.odometer - b.odometer);
  let distance = 0;
  let fuel = 0;
  for (let i = 1; i < sorted.length; i += 1) {
    const d = sorted[i].odometer - sorted[i - 1].odometer;
    if (d > 0) {
      distance += d;
      fuel += sorted[i].fuelAmount;
    }
  }
  const totalCost = entries.reduce((s, e) => s + (e.cost || 0), 0);
  const totalFuel = entries.reduce((s, e) => s + (e.fuelAmount || 0), 0);
  const span = sorted.length > 1 ? sorted[sorted.length - 1].odometer - sorted[0].odometer : 0;
  const costAfterFirst = sorted.slice(1).reduce((s, e) => s + (e.cost || 0), 0);
  return {
    efficiency: fuel > 0 ? distance / fuel : null,
    totalCost,
    totalFuel,
    costPerKm: span > 0 ? costAfterFirst / span : null,
    avgPrice: totalFuel > 0 ? totalCost / totalFuel : null,
  };
};

const FuelForm = ({ car, lastOdometer, onClose, onSaved }) => {
  const [form, setForm] = useState({
    date: toDateInput(),
    fuelAmount: '',
    cost: '',
    odometer: '',
    fuelType: 'petrol',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!(Number(form.fuelAmount) > 0)) next.fuelAmount = 'Enter the quantity';
    if (form.cost === '' || Number(form.cost) < 0) next.cost = 'Enter the amount paid';
    if (form.odometer === '' || Number(form.odometer) < 0) next.odometer = 'Enter the odometer reading';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const res = await api.post(`/api/cars/${car._id}/fuel-entries`, {
        ...form,
        fuelAmount: Number(form.fuelAmount),
        cost: Number(form.cost),
        odometer: Number(form.odometer),
      });
      toast.success('Fuel entry added');
      onSaved(res.data.data);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add the entry'));
      setSaving(false);
    }
  };

  const unit = form.fuelType === 'electric' ? 'kWh' : form.fuelType === 'cng' ? 'kg' : 'litres';

  return (
    <Modal
      title="Add fuel entry"
      description="Fill the tank completely each time for accurate mileage."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="fuel-form" loading={saving}>
            Add entry
          </Button>
        </>
      }
    >
      <form id="fuel-form" onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Date" htmlFor="fdate" required>
          <input id="fdate" type="date" max={toDateInput()} className="input" value={form.date} onChange={set('date')} />
        </Field>
        <Field label="Fuel type" htmlFor="ftype">
          <select id="ftype" className="input" value={form.fuelType} onChange={set('fuelType')}>
            {FUEL_TYPES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`Quantity (${unit})`} htmlFor="famount" required error={errors.fuelAmount}>
          <input id="famount" type="number" step="0.01" min="0" inputMode="decimal" className="input" value={form.fuelAmount} onChange={set('fuelAmount')} />
        </Field>
        <Field label="Amount paid (₹)" htmlFor="fcost" required error={errors.cost}>
          <input id="fcost" type="number" step="0.01" min="0" inputMode="decimal" className="input" value={form.cost} onChange={set('cost')} />
        </Field>
        <Field
          label="Odometer (km)"
          htmlFor="fodo"
          required
          error={errors.odometer}
          hint={lastOdometer ? `Last entry: ${formatNumber(lastOdometer)} km` : undefined}
          className="sm:col-span-2"
        >
          <input id="fodo" type="number" min="0" inputMode="numeric" className="input" value={form.odometer} onChange={set('odometer')} />
        </Field>
        <Field label="Notes" htmlFor="fnotes" className="sm:col-span-2">
          <input id="fnotes" className="input" maxLength={200} placeholder="Optional — e.g. highway trip" value={form.notes} onChange={set('notes')} />
        </Field>
      </form>
    </Modal>
  );
};

const FuelTracker = ({ car }) => {
  const confirm = useConfirm();
  const { data: entries, loading, error, setData } = useFetch(`/api/cars/${car._id}/fuel-entries`, { initialData: [] });
  const [adding, setAdding] = useState(false);
  const stats = useMemo(() => fuelStats(entries), [entries]);
  const newestFirst = useMemo(() => [...entries].sort((a, b) => b.odometer - a.odometer), [entries]);

  const handleDelete = async (entry) => {
    const ok = await confirm({ title: 'Delete fuel entry?', message: `${formatDate(entry.date)} · ${formatCurrency(entry.cost)}`, confirmText: 'Delete', tone: 'danger' });
    if (!ok) return;
    try {
      await api.delete(`/api/cars/${car._id}/fuel-entries/${entry._id}`);
      setData((prev) => prev.filter((e) => e._id !== entry._id));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (loading) return <PageLoader className="py-16" />;

  return (
    <div className="space-y-6">
      {error && <Alert tone="red">{error}</Alert>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Average mileage" value={stats.efficiency ? `${stats.efficiency.toFixed(1)} km/L` : '—'} hint={entries.length < 2 ? 'Needs 2+ entries' : 'Full-tank method'} icon="gauge" tone="blue" />
        <StatCard label="Running cost" value={stats.costPerKm ? `${formatCurrency(stats.costPerKm, { precise: true })}/km` : '—'} icon="trendUp" tone="amber" />
        <StatCard label="Total fuel spend" value={formatCurrency(stats.totalCost)} icon="wallet" tone="green" />
        <StatCard label="Avg. price" value={stats.avgPrice ? `${formatCurrency(stats.avgPrice, { precise: true })}/L` : '—'} icon="fuel" />
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Fuel log</h2>
            <p className="mt-0.5 text-sm text-slate-500">{entries.length} fill-ups recorded</p>
          </div>
          <Button size="sm" icon="plus" onClick={() => setAdding(true)}>
            Add entry
          </Button>
        </div>
        {entries.length === 0 ? (
          <EmptyState
            icon="fuel"
            title="No fuel entries yet"
            description="Record each fill-up with the odometer reading to calculate mileage and running cost."
            action={
              <Button icon="plus" onClick={() => setAdding(true)}>
                Add first entry
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th className="!text-right">Odometer</th>
                  <th className="!text-right">Quantity</th>
                  <th className="!text-right">Cost</th>
                  <th>Type</th>
                  <th>Notes</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {newestFirst.map((e) => (
                  <tr key={e._id}>
                    <td className="whitespace-nowrap">{formatDate(e.date)}</td>
                    <td className="text-right tabular-nums">{formatNumber(e.odometer)} km</td>
                    <td className="text-right tabular-nums">{formatNumber(e.fuelAmount)}</td>
                    <td className="text-right tabular-nums">{formatCurrency(e.cost)}</td>
                    <td className="capitalize">{e.fuelType === 'cng' ? 'CNG' : e.fuelType}</td>
                    <td className="max-w-[200px] truncate text-slate-500">{e.notes || '—'}</td>
                    <td className="text-right">
                      <button type="button" className="btn btn-danger-ghost btn-icon h-8 w-8" onClick={() => handleDelete(e)} aria-label="Delete entry">
                        <Icon name="trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {adding && (
        <FuelForm
          car={car}
          lastOdometer={newestFirst[0]?.odometer}
          onClose={() => setAdding(false)}
          onSaved={(entry) => {
            setData((prev) => [...prev, entry]);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
};

export default FuelTracker;
