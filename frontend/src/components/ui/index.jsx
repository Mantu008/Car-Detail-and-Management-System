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
    <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-card ring-1 ring-slate-200/80">
      <Spinner className="h-5 w-5 text-brand-600" />
    </span>
    <span className="text-sm font-medium">{label}</span>
  </div>
);

/** Shimmering placeholder block. */
export const Skeleton = ({ className = 'h-4 w-full' }) => <div className={`skeleton ${className}`} aria-hidden="true" />;

/** Placeholder that mirrors the stat-card row + two panels used on dashboards. */
export const DashboardSkeleton = () => (
  <div className="page" role="status" aria-label="Loading">
    <div className="mb-8 space-y-3">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </div>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="card space-y-4 p-5">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-20" />
        </div>
      ))}
    </div>
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <div className="card space-y-5 p-5 lg:col-span-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-12 w-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
      <div className="card space-y-4 p-5">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

/** Placeholder grid of vehicle cards. */
export const CardGridSkeleton = ({ count = 6 }) => (
  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="card overflow-hidden">
        <Skeleton className="aspect-[16/10] w-full rounded-none" />
        <div className="space-y-3 p-4">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="mt-4 h-8 w-full rounded-lg" />
        </div>
      </div>
    ))}
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
      <h1 className="text-2xl font-bold sm:text-[1.875rem]">{title}</h1>
      {description && <p className="mt-1 text-sm text-slate-500 sm:text-[15px]">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const EmptyState = ({ icon = 'info', title, description, action, className = '' }) => (
  <div className={`flex flex-col items-center px-6 py-14 text-center ${className}`}>
    <div className="relative mb-5">
      <div className="absolute inset-0 scale-150 rounded-full bg-brand-100/60 blur-xl" aria-hidden="true" />
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-card ring-1 ring-slate-200/80">
        <Icon name={icon} className="h-6 w-6" />
      </div>
    </div>
    <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const StatCard = ({ label, value, hint, icon, tone = 'slate' }) => {
  const tones = {
    slate: 'bg-slate-100 text-slate-600 ring-slate-200',
    blue: 'bg-brand-50 text-brand-600 ring-brand-100',
    green: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-600 ring-amber-100',
    red: 'bg-red-50 text-red-600 ring-red-100',
  };
  const glows = {
    slate: 'bg-slate-200',
    blue: 'bg-brand-200',
    green: 'bg-emerald-200',
    amber: 'bg-amber-200',
    red: 'bg-red-200',
  };
  return (
    <div className="card relative overflow-hidden p-5">
      <div className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-40 blur-2xl ${glows[tone]}`} aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon && (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${tones[tone]}`}>
            <Icon name={icon} />
          </span>
        )}
      </div>
      <p className="relative mt-3 font-display text-2xl font-bold tabular-nums text-slate-900 sm:text-[1.75rem]">{value}</p>
      {hint && <p className="relative mt-1 text-xs font-medium text-slate-500">{hint}</p>}
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
    className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 font-semibold text-white ring-2 ring-white ${size}`}
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
      <div className={`flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-brand-50 text-slate-300 ${className}`}>
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
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
          }`}
        >
          {tab.icon && <Icon name={tab.icon} />}
          {tab.label}
          {tab.count !== undefined && (
            <span className={`rounded-full px-1.5 py-0.5 text-xs ${value === tab.value ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-600'}`}>{tab.count}</span>
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
