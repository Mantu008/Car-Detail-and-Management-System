import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../config/api';
import { useConfirm } from '../../context/confirmContext';
import { Badge, Button, EmptyState, Field, Icon, Modal, statusTone } from '../ui';
import { errorMessage, formatCurrency, formatDate, toDateInput } from '../../utils/format';

const SERVICE_TYPES = ['maintenance', 'repair', 'inspection', 'other'];

const ServiceForm = ({ carId, service, onClose, onSaved }) => {
  const [form, setForm] = useState({
    serviceType: service?.serviceType || 'maintenance',
    date: toDateInput(service?.date || new Date()),
    cost: service?.cost ?? '',
    serviceProvider: service?.serviceProvider || '',
    nextServiceDate: service?.nextServiceDate ? toDateInput(service.nextServiceDate) : '',
    description: service?.description || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.description.trim()) next.description = 'Describe the work done';
    if (form.cost === '' || Number(form.cost) < 0) next.cost = 'Enter the cost';
    if (!form.date) next.date = 'Choose a date';
    if (form.nextServiceDate && form.nextServiceDate <= form.date) next.nextServiceDate = 'Must be after the service date';
    setErrors(next);
    if (Object.keys(next).length) return;

    const payload = { ...form, cost: Number(form.cost), car: carId, description: form.description.trim() };
    if (!payload.nextServiceDate) delete payload.nextServiceDate;

    setSaving(true);
    try {
      const res = service
        ? await api.put(`/api/services/${service._id}`, payload)
        : await api.post('/api/services', payload);
      toast.success(service ? 'Service updated' : 'Service added');
      onSaved(res.data.data);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save the service'));
      setSaving(false);
    }
  };

  return (
    <Modal
      title={service ? 'Edit service record' : 'Add service record'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="service-form" loading={saving}>
            {service ? 'Save changes' : 'Add service'}
          </Button>
        </>
      }
    >
      <form id="service-form" onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Type" htmlFor="serviceType" required>
          <select id="serviceType" className="input capitalize" value={form.serviceType} onChange={set('serviceType')}>
            {SERVICE_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Cost (₹)" htmlFor="cost" required error={errors.cost}>
          <input id="cost" type="number" min="0" inputMode="decimal" className={`input ${errors.cost ? 'input-error' : ''}`} value={form.cost} onChange={set('cost')} />
        </Field>
        <Field label="Service date" htmlFor="date" required error={errors.date}>
          <input id="date" type="date" max={toDateInput()} className="input" value={form.date} onChange={set('date')} />
        </Field>
        <Field label="Next service due" htmlFor="nextServiceDate" error={errors.nextServiceDate} hint="Optional — shows up as a reminder.">
          <input id="nextServiceDate" type="date" className="input" value={form.nextServiceDate} onChange={set('nextServiceDate')} />
        </Field>
        <Field label="Workshop / provider" htmlFor="serviceProvider" className="sm:col-span-2">
          <input id="serviceProvider" className="input" maxLength={100} placeholder="e.g. Authorised service centre" value={form.serviceProvider} onChange={set('serviceProvider')} />
        </Field>
        <Field label="Work done" htmlFor="description" required error={errors.description} className="sm:col-span-2">
          <textarea
            id="description"
            rows={3}
            maxLength={500}
            className={`input ${errors.description ? 'input-error' : ''}`}
            placeholder="e.g. Engine oil and oil filter replaced, brake pads checked"
            value={form.description}
            onChange={set('description')}
          />
        </Field>
      </form>
    </Modal>
  );
};

const ServiceHistory = ({ carId, services, setServices }) => {
  const confirm = useConfirm();
  const [editing, setEditing] = useState(null); // null | 'new' | service

  const total = services.reduce((sum, s) => sum + (s.cost || 0), 0);

  const handleSaved = (saved) => {
    setServices((prev) => {
      const rest = prev.filter((s) => s._id !== saved._id);
      return [saved, ...rest].sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    setEditing(null);
  };

  const handleDelete = async (service) => {
    const ok = await confirm({
      title: 'Delete this service record?',
      message: `${formatDate(service.date)} · ${formatCurrency(service.cost)}. This can't be undone.`,
      confirmText: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/api/services/${service._id}`);
      setServices((prev) => prev.filter((s) => s._id !== service._id));
      toast.success('Service record deleted');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete the record'));
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Service history</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {services.length} record{services.length === 1 ? '' : 's'} · {formatCurrency(total)} total
          </p>
        </div>
        <Button size="sm" icon="plus" onClick={() => setEditing('new')}>
          Add service
        </Button>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon="wrench"
          title="No service records yet"
          description="Log maintenance, repairs and inspections to build a complete history for this vehicle."
          action={
            <Button icon="plus" onClick={() => setEditing('new')}>
              Add first service
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {services.map((s) => {
            const due = s.nextServiceDate ? new Date(s.nextServiceDate) : null;
            return (
              <li key={s._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start">
                <div className="w-28 shrink-0 text-sm text-slate-500">{formatDate(s.date)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={statusTone(s.serviceType)}>{s.serviceType}</Badge>
                    {s.serviceProvider && <span className="text-sm text-slate-500">{s.serviceProvider}</span>}
                  </div>
                  <p className="mt-1.5 text-sm text-slate-800">{s.description}</p>
                  {due && (
                    <p className={`mt-1.5 flex items-center gap-1.5 text-xs ${due < new Date() ? 'text-red-600' : 'text-slate-500'}`}>
                      <Icon name="calendar" className="h-3.5 w-3.5" />
                      Next due {formatDate(due)}
                      {due < new Date() && ' (overdue)'}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 sm:flex-col sm:items-end">
                  <span className="font-semibold tabular-nums sm:mb-1">{formatCurrency(s.cost)}</span>
                  <div className="ml-auto flex sm:ml-0">
                    <button type="button" className="btn btn-ghost btn-icon h-8 w-8" onClick={() => setEditing(s)} aria-label="Edit service">
                      <Icon name="edit" />
                    </button>
                    <button type="button" className="btn btn-danger-ghost btn-icon h-8 w-8" onClick={() => handleDelete(s)} aria-label="Delete service">
                      <Icon name="trash" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <ServiceForm carId={carId} service={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={handleSaved} />
      )}
    </div>
  );
};

export default ServiceHistory;
