import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';
import { useAuth } from '../context/authContext';
import TwoFactorSetup from '../components/auth/TwoFactorAuth';
import { Alert, Badge, Button, Field, Modal, PageHeader } from '../components/ui';
import { StrengthMeter } from './auth/Register';
import { errorMessage, formatDate } from '../utils/format';

const Section = ({ title, description, children }) => (
  <section className="grid gap-6 border-b border-slate-200 py-8 first:pt-0 last:border-0 lg:grid-cols-3">
    <div>
      <h2 className="font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
    <div className="lg:col-span-2">{children}</div>
  </section>
);

const ProfileForm = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [saving, setSaving] = useState(false);
  const dirty = form.name.trim() !== user.name || form.email.trim().toLowerCase() !== user.email;

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/api/users/profile', { name: form.name.trim(), email: form.email.trim() });
      setUser(res.data.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="card card-body space-y-4">
      <Field label="Full name" htmlFor="pname">
        <input id="pname" className="input" required maxLength={50} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </Field>
      <Field label="Email" htmlFor="pemail">
        <input id="pemail" type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </Field>
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500">Member since {formatDate(user.createdAt)}</p>
        <Button type="submit" loading={saving} disabled={!dirty}>
          Save
        </Button>
      </div>
    </form>
  );
};

const PasswordForm = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setError('');
    if (form.newPassword.length < 6) return setError('New password must be at least 6 characters');
    if (form.newPassword !== form.confirm) return setError('New passwords do not match');
    setSaving(true);
    try {
      await api.put('/api/users/profile', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password changed');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <form onSubmit={save} className="card card-body space-y-4">
      {error && <Alert tone="red">{error}</Alert>}
      <Field label="Current password" htmlFor="cur">
        <input id="cur" type="password" autoComplete="current-password" className="input" required value={form.currentPassword} onChange={set('currentPassword')} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="New password" htmlFor="newp">
          <input id="newp" type="password" autoComplete="new-password" className="input" required value={form.newPassword} onChange={set('newPassword')} />
          <StrengthMeter password={form.newPassword} />
        </Field>
        <Field label="Confirm new password" htmlFor="conf">
          <input id="conf" type="password" autoComplete="new-password" className="input" required value={form.confirm} onChange={set('confirm')} />
        </Field>
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={saving}>
          Change password
        </Button>
      </div>
    </form>
  );
};

const DisableTwoFactor = ({ onClose, onDone }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/api/auth/2fa/disable', { code: code.trim() });
      toast.success('Two-factor authentication turned off');
      onDone();
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Turn off two-factor authentication"
      size="sm"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" type="submit" form="disable-2fa" loading={saving} disabled={code.length < 6}>
            Turn off
          </Button>
        </>
      }
    >
      <form id="disable-2fa" onSubmit={submit} className="space-y-4">
        {error && <Alert tone="red">{error}</Alert>}
        <p className="text-sm text-slate-600">Enter a code from your authenticator app (or a backup code) to confirm.</p>
        <input
          className="input text-center font-mono text-lg tracking-[0.3em]"
          autoFocus
          maxLength={10}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
      </form>
    </Modal>
  );
};

const Settings = () => {
  const { user, setUser } = useAuth();
  const [setupOpen, setSetupOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);

  return (
    <div className="page max-w-5xl">
      <PageHeader title="Account settings" description="Manage your profile, password and sign-in security." />

      <Section title="Profile" description="Your name and the email you sign in with.">
        <ProfileForm />
      </Section>

      <Section title="Password" description="Use at least 8 characters with a mix of letters, numbers and symbols.">
        <PasswordForm />
      </Section>

      <Section title="Two-factor authentication" description="Require a code from an authenticator app when you sign in.">
        <div className="card card-body flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">Authenticator app</p>
              {user.isTwoFactorEnabled ? <Badge tone="green" dot>On</Badge> : <Badge>Off</Badge>}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {user.isTwoFactorEnabled
                ? 'Your account is protected with a second sign-in step.'
                : 'Works with Google Authenticator, Microsoft Authenticator, Authy and others.'}
            </p>
          </div>
          {user.isTwoFactorEnabled ? (
            <Button variant="secondary" onClick={() => setDisableOpen(true)}>
              Turn off
            </Button>
          ) : (
            <Button icon="shield" onClick={() => setSetupOpen(true)}>
              Set up
            </Button>
          )}
        </div>
      </Section>

      {setupOpen && (
        <TwoFactorSetup
          onClose={() => setSetupOpen(false)}
          onEnabled={() => setUser({ ...user, isTwoFactorEnabled: true })}
        />
      )}
      {disableOpen && (
        <DisableTwoFactor
          onClose={() => setDisableOpen(false)}
          onDone={() => {
            setUser({ ...user, isTwoFactorEnabled: false });
            setDisableOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Settings;
