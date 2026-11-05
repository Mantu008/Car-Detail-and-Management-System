const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const inrPrecise = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
const number = new Intl.NumberFormat('en-IN');

/** ₹12,34,567 */
export const formatCurrency = (value, { precise = false } = {}) =>
  value === null || value === undefined || Number.isNaN(Number(value))
    ? '—'
    : (precise ? inrPrecise : inr).format(Number(value));

/** Compact rupees for tight spaces: ₹12.3L, ₹1.2Cr */
export const formatCurrencyCompact = (value) => {
  const n = Number(value) || 0;
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(n >= 1e8 ? 0 : 1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(n >= 1e6 ? 0 : 1)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1)}k`;
  return `₹${n}`;
};

export const formatNumber = (value) =>
  value === null || value === undefined || value === '' ? '—' : number.format(Number(value));

export const formatKm = (value) => (value || value === 0 ? `${formatNumber(value)} km` : '—');

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—';

/** "3 hours ago", "2 days ago" */
export const timeAgo = (value) => {
  if (!value) return '';
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(-Math.round(seconds / size), unit);
  }
  return 'just now';
};

/** Date -> "YYYY-MM-DD" for <input type="date"> */
export const toDateInput = (value = new Date()) => {
  const d = new Date(value);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
};

export const capitalize = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?';

export const vehicleName = (car) => (car ? `${car.brand} ${car.model}` : 'Unknown vehicle');

/** Pull the most useful message out of an axios error. */
export const errorMessage = (error, fallback = 'Something went wrong. Please try again.') =>
  error?.response?.data?.message || (error?.code === 'ECONNABORTED' ? 'The server took too long to respond.' : null) ||
  (error?.message === 'Network Error' ? 'Cannot reach the server. Check your connection.' : null) ||
  fallback;
