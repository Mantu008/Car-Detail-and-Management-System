import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../config/api';
import useFetch from '../hooks/useFetch';
import { Alert, Button, EmptyState, Field, Icon, PageHeader, PageLoader } from '../components/ui';
import { errorMessage, vehicleName } from '../utils/format';
import { getImageUrl } from '../utils/imageUtils';

const TYPES = ['Car', 'Motorbike', 'Truck', 'Auto', 'Other'];
const MAX_YEAR = new Date().getFullYear() + 1;
const MAX_IMAGE_MB = 5;

const emptyForm = { type: 'Car', brand: '', model: '', year: String(new Date().getFullYear()), price: '', color: '', mileage: '', description: '' };

const validate = (f) => {
  const e = {};
  if (!f.brand.trim()) e.brand = 'Enter the brand';
  if (!f.model.trim()) e.model = 'Enter the model';
  const year = Number(f.year);
  if (!Number.isInteger(year) || year < 1900 || year > MAX_YEAR) e.year = `Enter a year between 1900 and ${MAX_YEAR}`;
  if (f.price === '' || Number(f.price) < 0) e.price = 'Enter a valid price';
  if (f.mileage !== '' && Number(f.mileage) < 0) e.mileage = 'Odometer cannot be negative';
  return e;
};

const CarForm = ({ car, onSubmit, submitLabel }) => {
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const [form, setForm] = useState(() =>
    car
      ? {
          type: car.type || 'Car',
          brand: car.brand || '',
          model: car.model || '',
          year: String(car.year || ''),
          price: String(car.price ?? ''),
          color: car.color || '',
          mileage: car.mileage != null ? String(car.mileage) : '',
          description: car.description || '',
        }
      : emptyForm
  );
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(car?.image ? getImageUrl(car.image) : null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  // Release object URLs created for previews.
  useEffect(() => () => preview?.startsWith('blob:') && URL.revokeObjectURL(preview), [preview]);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const pickImage = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file');
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return toast.error(`Image must be smaller than ${MAX_IMAGE_MB} MB`);
    setImage(file);
    setPreview(URL.createObjectURL(file));
    return undefined;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    // Send only meaningful values - never the string "undefined".
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      const v = typeof value === 'string' ? value.trim() : value;
      if (v !== '' || car) data.append(key, v);
    });
    if (image) data.append('image', image);

    setSaving(true);
    try {
      await onSubmit(data);
    } catch (err) {
      setServerError(errorMessage(err, 'Could not save the vehicle'));
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const input = (key, props = {}) => (
    <input id={key} className={`input ${errors[key] ? 'input-error' : ''}`} value={form[key]} onChange={set(key)} {...props} />
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {serverError && <Alert tone="red">{serverError}</Alert>}

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Vehicle details</h2>
            <p className="mt-0.5 text-sm text-slate-500">Basic information used across reports and analytics.</p>
          </div>
        </div>
        <div className="card-body grid gap-5 sm:grid-cols-2">
          <Field label="Type" htmlFor="type" required>
            <select id="type" className="input" value={form.type} onChange={set('type')}>
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Year" htmlFor="year" required error={errors.year}>
            {input('year', { type: 'number', inputMode: 'numeric', min: 1900, max: MAX_YEAR })}
          </Field>
          <Field label="Brand" htmlFor="brand" required error={errors.brand}>
            {input('brand', { placeholder: 'e.g. Maruti Suzuki', maxLength: 50 })}
          </Field>
          <Field label="Model" htmlFor="model" required error={errors.model}>
            {input('model', { placeholder: 'e.g. Swift VXi', maxLength: 50 })}
          </Field>
          <Field label="Price (₹)" htmlFor="price" required error={errors.price} hint="Purchase price or current value.">
            {input('price', { type: 'number', inputMode: 'decimal', min: 0, placeholder: '650000' })}
          </Field>
          <Field label="Odometer (km)" htmlFor="mileage" error={errors.mileage}>
            {input('mileage', { type: 'number', inputMode: 'numeric', min: 0, placeholder: '24500' })}
          </Field>
          <Field label="Colour" htmlFor="color">
            {input('color', { placeholder: 'e.g. Pearl White', maxLength: 30 })}
          </Field>
          <Field label="Description" htmlFor="description" className="sm:col-span-2" hint={`${form.description.length}/500`}>
            <textarea
              id="description"
              rows={4}
              maxLength={500}
              className="input resize-y"
              placeholder="Registration number, variant, insurance details, anything worth remembering…"
              value={form.description}
              onChange={set('description')}
            />
          </Field>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Photo</h2>
            <p className="mt-0.5 text-sm text-slate-500">JPG, PNG or WEBP up to {MAX_IMAGE_MB} MB.</p>
          </div>
        </div>
        <div className="card-body">
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => pickImage(e.target.files[0])} />
          {preview ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <img src={preview} alt="Vehicle preview" className="h-40 w-full rounded-lg border border-slate-200 object-cover sm:w-64" />
              <div className="flex gap-2">
                <Button variant="secondary" icon="upload" onClick={() => fileInput.current.click()}>
                  Replace
                </Button>
                {image && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setImage(null);
                      setPreview(car?.image ? getImageUrl(car.image) : null);
                      fileInput.current.value = '';
                    }}
                  >
                    Undo
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInput.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pickImage(e.dataTransfer.files[0]);
              }}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-6 py-10 text-center transition-colors hover:border-slate-400 hover:bg-slate-50"
            >
              <Icon name="image" className="h-8 w-8 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Click to upload or drag and drop</span>
              <span className="text-xs text-slate-500">A clear side or front view works best</span>
            </button>
          )}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={() => navigate(-1)} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

const BackLink = ({ to, label }) => (
  <Link to={to} className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
    <Icon name="arrowLeft" /> {label}
  </Link>
);

export const AddCar = () => {
  const navigate = useNavigate();
  const handleSubmit = async (data) => {
    const res = await api.post('/api/cars', data);
    toast.success('Vehicle added');
    navigate(`/cars/${res.data.data._id}`);
  };

  return (
    <div className="page max-w-3xl">
      <PageHeader title="Add vehicle" description="You can add services and fuel entries once it's saved." back={<BackLink to="/my-cars" label="My vehicles" />} />
      <CarForm onSubmit={handleSubmit} submitLabel="Add vehicle" />
    </div>
  );
};

export const EditCar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: car, loading, error } = useFetch(`/api/cars/${id}`);

  const handleSubmit = async (data) => {
    await api.put(`/api/cars/${id}`, data);
    toast.success('Changes saved');
    navigate(`/cars/${id}`);
  };

  if (loading) return <PageLoader />;
  if (error || !car || !car.canManage) {
    return (
      <div className="page">
        <div className="card">
          <EmptyState
            icon="alert"
            title={error ? 'Vehicle not found' : 'You can’t edit this vehicle'}
            description={error || 'Only the owner or an administrator can make changes.'}
            action={
              <Link to="/my-cars" className="btn btn-secondary">
                Back to my vehicles
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page max-w-3xl">
      <PageHeader title={`Edit ${vehicleName(car)}`} back={<BackLink to={`/cars/${id}`} label="Back to vehicle" />} />
      <CarForm car={car} onSubmit={handleSubmit} submitLabel="Save changes" />
    </div>
  );
};
