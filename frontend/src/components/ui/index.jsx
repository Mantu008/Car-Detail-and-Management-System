import { useState } from 'react';
import Icon from './Icon';
import { getImageUrl } from '../../utils/imageUtils';
import { initials } from '../../utils/format';

export { default as Icon } from './Icon';
export { default as Modal } from './Modal';

export const Spinner = ({ className = 'h-4 w-4' }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
    <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const PageLoader = ({ label = 'Loading…', className = 'min-h-[50vh]' }) => (
  <div className={`flex flex-col items-center justify-center gap-3 text-slate-500 ${className}`} role="status">
    <Spinner className="h-6 w-6 text-slate-400" />
    <span className="text-sm">{label}</span>
  </div>
);

export const Button = ({ variant = 'primary', size, loading = false, icon, children, className = '', ...props }) => (
  <button
    type="button"
    className={`btn btn-${variant} ${size ? `btn-${size}` : ''} ${className}`}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading ? <Spinner /> : icon ? <Icon name={icon} /> : null}
    {children}
  </button>
);

export const PageHeader = ({ title, description, actions, back }) => (
  <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      {back}
      <h1 className="text-2xl font-semibold sm:text-[1.75rem]">{title}</h1>
      {description && <p className="mt-1 text-sm text-slate-500 sm:text-[15px]">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const EmptyState = ({ icon = 'info', title, description, action, className = '' }) => (
  <div className={`flex flex-col items-center px-6 py-12 text-center ${className}`}>
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
      <Icon name={icon} className="h-6 w-6" />
    </div>
    <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const StatCard = ({ label, value, hint, icon, tone = 'slate' }) => {
  const tones = {
    slate: 'bg-slate-100 text-slate-600',
    blue: 'bg-brand-50 text-brand-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon && (
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}>
            <Icon name={icon} />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
};

const badgeTones = {
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  blue: 'bg-brand-50 text-brand-700 ring-brand-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
};

export const Badge = ({ tone = 'slate', children, dot = false, className = '' }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${badgeTones[tone]} ${className}`}
  >
    {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
    {children}
  </span>
);

/** Map common status words to badge colours. */
export const statusTone = (status) =>
  ({
    active: 'green',
    normal: 'green',
    resolved: 'green',
    success: 'green',
    blocked: 'red',
    suspicious: 'red',
    error: 'red',
    high: 'red',
    open: 'blue',
    info: 'blue',
    'in-progress': 'amber',
    warning: 'amber',
    medium: 'amber',
    closed: 'slate',
    low: 'slate',
  })[status] || 'slate';

export const Avatar = ({ name, size = 'h-8 w-8 text-xs' }) => (
  <span
    className={`inline-flex shrink-0 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-700 ${size}`}
  >
    {initials(name)}
  </span>
);

export const Field = ({ label, htmlFor, hint, error, required, children, className = '' }) => (
  <div className={className}>
    {label && (
      <label htmlFor={htmlFor} className="label">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
    )}
    {children}
    {error ? <p className="error-text">{error}</p> : hint ? <p className="hint">{hint}</p> : null}
  </div>
);

/** Vehicle photo with a neutral placeholder when missing or broken. */
export const VehicleImage = ({ src, alt, className = 'h-44 w-full', iconClass = 'h-10 w-10' }) => {
  const [failed, setFailed] = useState(false);
  const url = getImageUrl(src);

  if (!url || failed) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-slate-300 ${className}`}>
        <Icon name="car" className={iconClass} strokeWidth={1.25} />
      </div>
    );
  }
  return <img src={url} alt={alt} loading="lazy" className={`object-cover ${className}`} onError={() => setFailed(true)} />;
};

export const Tabs = ({ tabs, value, onChange }) => (
  <div className="border-b border-slate-200">
    <nav className="-mb-px flex gap-6 overflow-x-auto" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
          className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-0.5 pb-3 text-sm font-medium transition-colors ${
            value === tab.value
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
          }`}
        >
          {tab.icon && <Icon name={tab.icon} />}
          {tab.label}
          {tab.count !== undefined && (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{tab.count}</span>
          )}
        </button>
      ))}
    </nav>
  </div>
);

export const SearchInput = ({ value, onChange, placeholder = 'Search…', className = '' }) => (
  <div className={`relative ${className}`}>
    <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    <input
      type="search"
      className="input pl-9"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

export const Alert = ({ tone = 'blue', icon, title, children, className = '' }) => {
  const tones = {
    blue: 'border-brand-200 bg-brand-50 text-brand-800',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    red: 'border-red-200 bg-red-50 text-red-800',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  };
  const icons = { blue: 'info', amber: 'alert', red: 'xCircle', green: 'checkCircle' };
  return (
    <div className={`flex gap-3 rounded-lg border px-4 py-3 text-sm ${tones[tone]} ${className}`} role="alert">
      <Icon name={icon || icons[tone]} className="mt-0.5 h-4 w-4" />
      <div className="min-w-0">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={title ? 'mt-0.5 opacity-90' : ''}>{children}</div>}
      </div>
    </div>
  );
};
