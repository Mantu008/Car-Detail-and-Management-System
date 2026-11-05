import { Fragment, useEffect, useState } from 'react';
import api from '../../config/api';
import { Alert, Badge, Button, EmptyState, Icon, PageHeader, PageLoader } from '../../components/ui';
import { errorMessage, formatDateTime } from '../../utils/format';

const actionTone = (action) => {
  if (/DELETE|BLOCK_USER|FLAG_VEHICLE|FAILED/.test(action) && !/UNBLOCK|UNFLAG/.test(action)) return 'red';
  if (/CREATE|REGISTER|ENABLE/.test(action)) return 'green';
  if (/UPDATE|UNBLOCK|UNFLAG/.test(action)) return 'blue';
  if (/LOGIN/.test(action)) return 'slate';
  return 'amber';
};
const humanize = (action) => action.toLowerCase().replace(/_/g, ' ');

const MetaDetails = ({ meta }) => {
  const entries = Object.entries(meta || {});
  if (!entries.length) return <span className="text-slate-400">No details</span>;
  return (
    <dl className="grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
      {entries.map(([k, v]) => (
        <div key={k} className="flex gap-2">
          <dt className="text-slate-500">{k}</dt>
          <dd className="break-all font-mono text-slate-700">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</dd>
        </div>
      ))}
    </dl>
  );
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [actions, setActions] = useState([]);
  const [action, setAction] = useState('');
  const [limit, setLimit] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get('/api/admin/logs', { params: { action: action || undefined, limit } })
      .then((res) => {
        if (cancelled) return;
        setLogs(res.data.data);
        setActions(res.data.actions || []);
        setError('');
      })
      .catch((err) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [action, limit]);

  return (
    <>
      <PageHeader
        title="Audit log"
        description="Security-relevant actions across the system, newest first."
        actions={
          <select className="input w-56" value={action} onChange={(e) => setAction(e.target.value)} aria-label="Filter by action">
            <option value="">All actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {humanize(a)}
              </option>
            ))}
          </select>
        }
      />
      {error && <Alert tone="red" className="mb-6">{error}</Alert>}

      <div className="card overflow-hidden">
        {loading ? (
          <PageLoader className="py-16" />
        ) : logs.length === 0 ? (
          <EmptyState icon="list" title="No log entries" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Action</th>
                  <th>User</th>
                  <th>By</th>
                  <th>IP</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <Fragment key={log._id}>
                    <tr className="cursor-pointer" onClick={() => setExpanded(expanded === log._id ? null : log._id)}>
                      <td className="whitespace-nowrap text-slate-500">{formatDateTime(log.timestamp)}</td>
                      <td>
                        <Badge tone={actionTone(log.action)}>{humanize(log.action)}</Badge>
                      </td>
                      <td>
                        {log.user ? (
                          <>
                            <p className="text-slate-900">{log.user.name}</p>
                            <p className="text-xs text-slate-500">{log.user.email}</p>
                          </>
                        ) : (
                          <span className="text-slate-400">{log.meta?.email || '—'}</span>
                        )}
                      </td>
                      <td className="capitalize">{log.performedBy}</td>
                      <td className="font-mono text-xs text-slate-500">{log.ip || '—'}</td>
                      <td className="text-right">
                        <Icon name={expanded === log._id ? 'chevronDown' : 'chevronRight'} className="inline h-4 w-4 text-slate-400" />
                      </td>
                    </tr>
                    {expanded === log._id && (
                      <tr className="bg-slate-50/70 hover:bg-slate-50/70">
                        <td colSpan={6}>
                          <MetaDetails meta={log.meta} />
                          {log.userAgent && <p className="mt-2 truncate text-xs text-slate-400">{log.userAgent}</p>}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && logs.length >= limit && (
        <div className="mt-4 text-center">
          <Button variant="secondary" onClick={() => setLimit((l) => Math.min(l + 100, 500))} disabled={limit >= 500}>
            Load more
          </Button>
        </div>
      )}
    </>
  );
};

export default AuditLogs;
