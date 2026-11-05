import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../config/api';
import useFetch from '../../hooks/useFetch';
import { Alert, Badge, Button, EmptyState, Field, PageHeader, PageLoader, statusTone } from '../../components/ui';
import { errorMessage, formatDateTime, timeAgo } from '../../utils/format';

const emptyForm = { subject: '', priority: 'low', message: '' };

const Support = () => {
  const { data: tickets, loading, error, setData } = useFetch('/api/support', { initialData: [] });
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return toast.info('Add a subject and a message');
    setSaving(true);
    try {
      const res = await api.post('/api/support', { ...form, subject: form.subject.trim(), message: form.message.trim() });
      setData((prev) => [res.data.data, ...prev]);
      setForm(emptyForm);
      toast.success("Ticket submitted. We'll get back to you soon.");
    } catch (err) {
      toast.error(errorMessage(err, 'Could not submit the ticket'));
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page">
      <PageHeader title="Support" description="Report a problem or ask a question. Replies appear here and in your notifications." />

      <div className="grid gap-6 lg:grid-cols-5">
        <form onSubmit={submit} className="card h-fit lg:col-span-2">
          <div className="card-header">
            <h2 className="card-title">New ticket</h2>
          </div>
          <div className="card-body space-y-4">
            <Field label="Subject" htmlFor="subject" required>
              <input id="subject" className="input" maxLength={100} placeholder="Briefly describe the issue" value={form.subject} onChange={set('subject')} />
            </Field>
            <Field label="Priority" htmlFor="priority">
              <select id="priority" className="input" value={form.priority} onChange={set('priority')}>
                <option value="low">Low — general question</option>
                <option value="medium">Medium — something isn't working</option>
                <option value="high">High — I can't use the app</option>
              </select>
            </Field>
            <Field label="Message" htmlFor="message" required hint={`${form.message.length}/1000`}>
              <textarea id="message" rows={6} maxLength={1000} className="input" placeholder="What happened, and what did you expect?" value={form.message} onChange={set('message')} />
            </Field>
            <Button type="submit" className="w-full" loading={saving} icon="send">
              Submit ticket
            </Button>
          </div>
        </form>

        <section className="lg:col-span-3">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Your tickets ({tickets.length})</h2>
          {error && <Alert tone="red">{error}</Alert>}
          {tickets.length === 0 ? (
            <div className="card">
              <EmptyState icon="lifebuoy" title="No tickets yet" description="When you contact support, your conversations show up here." />
            </div>
          ) : (
            <ul className="space-y-3">
              {tickets.map((t) => (
                <li key={t._id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium">{t.subject}</p>
                      <p className="text-xs text-slate-500" title={formatDateTime(t.createdAt)}>
                        Opened {timeAgo(t.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <Badge tone={statusTone(t.priority)}>{t.priority}</Badge>
                      <Badge tone={statusTone(t.status)} dot>
                        {t.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm text-slate-600">{t.message}</p>
                  {t.adminResponse && (
                    <div className="mt-4 rounded-lg border-l-2 border-brand-500 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-medium text-slate-500">Support team replied</p>
                      <p className="mt-1 whitespace-pre-line text-sm text-slate-800">{t.adminResponse}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default Support;
