import { useMemo, useState } from 'react';
import { Alert, Badge, EmptyState, Field, statusTone } from './ui';
import { capitalize, formatCurrency, formatDate } from '../utils/format';

const TYPES = ['maintenance', 'repair', 'inspection', 'other'];

const confidence = (count) => {
  if (count >= 5) return { label: 'High', tone: 'green' };
  if (count >= 3) return { label: 'Medium', tone: 'amber' };
  return { label: 'Low', tone: 'slate' };
};

/** Historic cost statistics per service type, plus a quote checker. */
const ServiceCostEstimator = ({ services }) => {
  const [type, setType] = useState('');
  const [quote, setQuote] = useState('');

  const estimates = useMemo(
    () =>
      TYPES.map((t) => {
        const list = services.filter((s) => s.serviceType === t).sort((a, b) => new Date(a.date) - new Date(b.date));
        if (!list.length) return null;
        const costs = list.map((s) => s.cost || 0);
        const average = costs.reduce((a, b) => a + b, 0) / costs.length;
        // Trend: average of the latest half vs the earlier half.
        let trend = null;
        if (list.length >= 4) {
          const half = Math.floor(list.length / 2);
          const older = costs.slice(0, half).reduce((a, b) => a + b, 0) / half;
          const recent = costs.slice(half).reduce((a, b) => a + b, 0) / (costs.length - half);
          trend = older ? ((recent - older) / older) * 100 : null;
        }
        return { type: t, count: list.length, average, min: Math.min(...costs), max: Math.max(...costs), last: list[list.length - 1], trend };
      }).filter(Boolean),
    [services]
  );

  if (!services.length) {
    return (
      <div className="card">
        <EmptyState icon="calculator" title="Not enough data yet" description="Cost insights appear once this vehicle has a few service records." />
      </div>
    );
  }

  const selected = estimates.find((e) => e.type === type);
  const quoteValue = Number(quote);
  const diff = selected && quoteValue > 0 ? ((quoteValue - selected.average) / selected.average) * 100 : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {estimates.map((e) => {
          const c = confidence(e.count);
          return (
            <div key={e.type} className="card p-5">
              <div className="flex items-center justify-between">
                <Badge tone={statusTone(e.type)}>{e.type}</Badge>
                <span className="text-xs text-slate-500">{e.count} records</span>
              </div>
              <p className="mt-3 text-xs text-slate-500">Typical cost</p>
              <p className="text-2xl font-semibold tabular-nums">{formatCurrency(e.average)}</p>
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Range</dt>
                  <dd className="tabular-nums">
                    {formatCurrency(e.min)} – {formatCurrency(e.max)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Last done</dt>
                  <dd>{formatDate(e.last.date)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Confidence</dt>
                  <dd>
                    <Badge tone={c.tone}>{c.label}</Badge>
                  </dd>
                </div>
                {e.trend !== null && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Trend</dt>
                    <dd className={e.trend > 0 ? 'text-red-600' : 'text-emerald-600'}>
                      {e.trend > 0 ? '+' : ''}
                      {e.trend.toFixed(0)}%
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Check a quote</h2>
            <p className="mt-0.5 text-sm text-slate-500">Compare a workshop quote with what you've paid before.</p>
          </div>
        </div>
        <div className="card-body space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Service type" htmlFor="qtype">
              <select id="qtype" className="input" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">Select…</option>
                {estimates.map((e) => (
                  <option key={e.type} value={e.type}>
                    {capitalize(e.type)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Quoted amount (₹)" htmlFor="qamount">
              <input id="qamount" type="number" min="0" className="input" value={quote} onChange={(e) => setQuote(e.target.value)} />
            </Field>
          </div>
          {diff !== null && (
            <Alert tone={Math.abs(diff) < 10 ? 'green' : diff > 25 ? 'red' : 'amber'}>
              This quote is <strong>{Math.abs(diff).toFixed(0)}% {diff >= 0 ? 'above' : 'below'}</strong> your average of{' '}
              {formatCurrency(selected.average)} for {selected.type}.{' '}
              {Math.abs(diff) < 10
                ? 'That is in line with your history.'
                : diff > 25
                  ? 'Consider asking for an itemised estimate or a second quote.'
                  : 'Worth a quick comparison with another workshop.'}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCostEstimator;
