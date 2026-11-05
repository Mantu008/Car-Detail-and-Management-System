import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../config/api';
import useFetch from '../../hooks/useFetch';
import { Alert, Badge, Button, EmptyState, Field, Icon, PageHeader, PageLoader, statusTone } from '../../components/ui';
import { errorMessage, formatDateTime, timeAgo } from '../../utils/format';

const STATUSES = ['open', 'in-progress', 'resolved', 'closed'];
const label = (s) => s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ');

const TicketDetail = ({ ticket, onUpdated, onBack }) => {
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState(ticket.status);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setReply('');
    setStatus(ticket.status === 'open' ? 'resolved' : ticket.status);
  }, [ticket._id, ticket.status]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/api/admin/support/${ticket._id}`, { status, adminResponse: reply });
      onUpdated(res.data.data);
      setReply('');
      toast.success('Ticket updated');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card flex h-full flex-col">
      <div className="border-b border-slate-200 px-5 py-4">
        <button type="button" onClick={onBack} className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 lg:hidden">
          <Icon name="arrowLeft" /> All tickets
        </button>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="text-lg font-semibold">{ticket.subject}</h2>
          <div className="flex gap-1.5">
            <Badge tone={statusTone(ticket.priority)}>{ticket.priority}</Badge>
            <Badge tone={statusTone(ticket.status)} dot>
              {label(ticket.status)}
            </Badge>
          </div>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {ticket.user?.name} · {ticket.user?.email} · {formatDateTime(ticket.createdAt)}
        </p>
      </div>

      <div className="flex-1 space-y-4 px-5 py-5">
        <p className="whitespace-pre-line text-sm text-slate-800">{ticket.message}</p>
        {ticket.adminResponse && (
          <div className="rounded-lg border-l-2 border-brand-500 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium text-slate-500">
              Your reply{ticket.resolvedAt ? ` · resolved ${formatDateTime(ticket.resolvedAt)}` : ''}
            </p>
            <p className="mt-1 whitespace-pre-line text-sm text-slate-800">{ticket.adminResponse}</p>
          </div>
        )}
      </div>

      <form onSubmit={save} className="space-y-3 border-t border-slate-200 px-5 py-4">
        <Field label={ticket.adminResponse ? 'Update reply' : 'Reply'} htmlFor="reply">
          <textarea id="reply" rows={4} className="input" placeholder="Write a response to the user…" value={reply} onChange={(e) => setReply(e.target.value)} />
        </Field>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <select className="input sm:w-44" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                Set {label(s).toLowerCase()}
              </option>
            ))}
          </select>
          <Button type="submit" icon="send" loading={saving} disabled={!reply.trim() && status === ticket.status}>
            Update ticket
          </Button>
        </div>
      </form>
    </div>
  );
};

const SupportAdmin = () => {
  const { data: tickets, loading, error, setData } = useFetch('/api/admin/support', { initialData: [] });
  const [filter, setFilter] = useState('active');
  const [selectedId, setSelectedId] = useState(null);

  const visible = useMemo(
    () => tickets.filter((t) => (filter === 'active' ? ['open', 'in-progress'].includes(t.status) : filter === 'all' || t.status === filter)),
    [tickets, filter]
  );
  const selected = tickets.find((t) => t._id === selectedId);

  if (loading) return <PageLoader />;

  return (
    <>
      <PageHeader title="Support tickets" description={`${tickets.filter((t) => t.status === 'open').length} open`} />
      {error && <Alert tone="red" className="mb-6">{error}</Alert>}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className={`card overflow-hidden lg:col-span-2 ${selected ? 'hidden lg:block' : ''}`}>
          <div className="border-b border-slate-200 p-3">
            <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter tickets">
              <option value="active">Open &amp; in progress</option>
              <option value="all">All tickets</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {label(s)}
                </option>
              ))}
            </select>
          </div>
          {visible.length === 0 ? (
            <EmptyState icon="lifebuoy" title="No tickets here" />
          ) : (
            <ul className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto">
              {visible.map((t) => (
                <li key={t._id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(t._id)}
                    className={`w-full px-4 py-3.5 text-left transition-colors hover:bg-slate-50 ${selectedId === t._id ? 'bg-slate-100' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{t.subject}</p>
                      <span className="shrink-0 text-xs text-slate-500">{timeAgo(t.createdAt)}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Badge tone={statusTone(t.status)} dot>
                        {label(t.status)}
                      </Badge>
                      {t.priority !== 'low' && <Badge tone={statusTone(t.priority)}>{t.priority}</Badge>}
                      <span className="truncate text-xs text-slate-500">{t.user?.name}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={`lg:col-span-3 ${selected ? '' : 'hidden lg:block'}`}>
          {selected ? (
            <TicketDetail
              ticket={selected}
              onBack={() => setSelectedId(null)}
              onUpdated={(updated) => setData((prev) => prev.map((t) => (t._id === updated._id ? updated : t)))}
            />
          ) : (
            <div className="card">
              <EmptyState icon="lifebuoy" title="Select a ticket" description="Choose a ticket on the left to read and reply." />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SupportAdmin;
