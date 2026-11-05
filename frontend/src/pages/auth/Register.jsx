import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { Alert, Button, Field } from '../../components/ui';
import AuthLayout from './AuthLayout';

export const passwordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
  if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
  if (score === 3) return { score: 3, label: 'Good', color: 'bg-brand-500' };
  return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
};

export const StrengthMeter = ({ password }) => {
  if (!password) return null;
  const strength = passwordStrength(password);
  return (
    <div className="mt-2 flex items-center gap-3">
      <div className="flex flex-1 gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={`h-1 flex-1 rounded-full ${i <= strength.score ? strength.color : 'bg-slate-200'}`} />
        ))}
      </div>
      <span className="w-12 text-right text-xs text-slate-500">{strength.label}</span>
    </div>
  );
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    if (errors[key]) setErrors({ ...errors, [key]: undefined });
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = 'Enter a valid email address';
    if (form.password.length < 6) next.password = 'Use at least 6 characters';
    if (form.confirm !== form.password) next.confirm = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setSubmitting(true);
    const result = await register(form.name.trim(), form.email.trim(), form.password);
    setSubmitting(false);

    if (result.ok) navigate('/', { replace: true });
    else setServerError(result.message);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking your vehicles in under a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="link">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {serverError && <Alert tone="red">{serverError}</Alert>}
        <Field label="Full name" htmlFor="name" error={errors.name}>
          <input id="name" className={`input ${errors.name ? 'input-error' : ''}`} autoComplete="name" autoFocus value={form.name} onChange={set('name')} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email}>
          <input
            id="email"
            type="email"
            className={`input ${errors.email ? 'input-error' : ''}`}
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
          />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password}>
          <input
            id="password"
            type="password"
            className={`input ${errors.password ? 'input-error' : ''}`}
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
          />
          <StrengthMeter password={form.password} />
        </Field>
        <Field label="Confirm password" htmlFor="confirm" error={errors.confirm}>
          <input
            id="confirm"
            type="password"
            className={`input ${errors.confirm ? 'input-error' : ''}`}
            autoComplete="new-password"
            value={form.confirm}
            onChange={set('confirm')}
          />
        </Field>
        <Button type="submit" className="w-full" size="lg" loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Register;
