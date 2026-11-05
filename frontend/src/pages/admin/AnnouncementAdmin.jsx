import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../config/api';
import useFetch from '../../hooks/useFetch';
import { useConfirm } from '../../context/confirmContext';
import { Alert, Badge, Button, EmptyState, Field, Icon, Modal, PageHeader, PageLoader, statusTone } from '../../components/ui';
import { errorMessage, formatDate, formatDateTime, toDateInput } from '../../utils/format';

const emptyForm = { title: '', message: '', type: 'info', expiresAt: '' };

const AnnouncementForm = ({ onClose, onCreated }) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, title: form.title.trim(), message: form.message.trim() };
      if (!payload.expiresAt) delete payload.expiresAt;
      else payload.expiresAt = new Date(`${payload.expiresAt}T23:59:59`).toISOString();
      const res = await api.post('/api/announcements', payload);
      toast.success('Announcement published to all users');
      onCreated(res.data.data);
    } catch (err) {
      toast.error(errorMessage(err));
      setSaving(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <Modal
      title="New announcement"
      description="Shown to every user and delivered instantly to anyone online."
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="announcement-form" icon="megaphone" loading={saving} disabled={!form.title.trim() || !form.message.trim()}>
            Publish
          </Button>
        </>
      }
    >
      <form id="announcement-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" htmlFor="atitle" required className="sm:col-span-2">
          <input id="atitle" className="input" maxLength={100} value={form.title} onChange={set('title')} autoFocus />
        </Field>
        <Field label="Type" htmlFor="atype">
          <select id="atype" className="input" value={form.type} onChange={set('type')}>
            <option value="info">Information</option>
            <option value="success">Good news</option>
            <option value="warning">Warning</option>
            <option value="error">Critical</option>
          </select>
        </Field>
        <Field label="Expires on" htmlFor="aexp" hint="Optional — hidden after this date.">
          <input id="aexp" type="date" min={toDateInput(tomorrow)} className="input" value={form.expiresAt} onChange={set('expiresAt')} />
        </Field>
        <Field label="Message" htmlFor="amsg" required hint={`${form.message.length}/500`} className="sm:col-span-2">
          <textarea id="amsg" rows={5} maxLength={500} className="input" value={form.message} onChange={set('message')} />
        </Field>
      </form>
    </Modal>
  );
};

const AnnouncementAdmin = () => {
  const { data: announcements, loading, error, setData } = useFetch('/api/announcements', { initialData: [] });
  const confirm = useConfirm();
  const [creating, setCreating] = useState(false);

  const remove = async (a) => {
    const ok = await confirm({ title: 'Delete announcement?', message: `"${a.title}" will be removed for all users.`, confirmText: 'Delete', tone: 'danger' });
    if (!ok) return;
    try {
      await api.delete(`/api/announcements/${a._id}`);
      setData((prev) => prev.filter((x) => x._id !== a._id));
      toast.success('Announcement deleted');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (loading) return <PageLoader />;

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Broadcast messages to all users."
        actions={
          <Button icon="plus" onClick={() => setCreating(true)}>
            New announcement
          </Button>
        }
      />
      {error && <Alert tone="red" className="mb-6">{error}</Alert>}

      <div className="card overflow-hidden">
        {announcements.length === 0 ? (
          <EmptyState
            icon="megaphone"
            title="No active announcements"
            action={
              <Button icon="plus" onClick={() => setCreating(true)}>
                Create one
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {announcements.map((a) => (
              <li key={a._id} className="flex gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={statusTone(a.type)} dot>
                      {a.type}
                    </Badge>
                    <span className="text-xs text-slate-500">{formatDateTime(a.createdAt)}</span>
                    {a.expiresAt && <span className="text-xs text-slate-500">· expires {formatDate(a.expiresAt)}</span>}
                  </div>
                  <p className="mt-1.5 font-medium">{a.title}</p>
                  <p className="mt-0.5 whitespace-pre-line text-sm text-slate-600">{a.message}</p>
                </div>
                <button type="button" onClick={() => remove(a)} className="btn btn-danger-ghost btn-icon h-8 w-8 shrink-0" aria-label="Delete announcement">
                  <Icon name="trash" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {creating && (
        <AnnouncementForm
          onClose={() => setCreating(false)}
          onCreated={(a) => {
            setData((prev) => [a, ...prev]);
            setCreating(false);
          }}
        />
      )}
    </>
  );
};

export default AnnouncementAdmin;
