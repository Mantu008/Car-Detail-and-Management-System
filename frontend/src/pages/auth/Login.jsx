import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { Alert, Button, Field, Icon } from '../../components/ui';
import AuthLayout from './AuthLayout';

const Login = () => {
  const { login, verifyTwoFactor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const goToApp = (user) => navigate(location.state?.from || (user.role === 'admin' ? '/admin' : '/'), { replace: true });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(form.email.trim(), form.password);
    setSubmitting(false);

    if (result.ok) return goToApp(result.user);
    if (result.requires2FA) return setTempToken(result.tempToken);
    return setError(result.message);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await verifyTwoFactor(tempToken, code.trim());
    setSubmitting(false);

    if (result.ok) return goToApp(result.user);
    if (/expired|log in again/i.test(result.message)) {
      setTempToken(null);
      setCode('');
    }
    return setError(result.message);
  };

  if (tempToken) {
    return (
      <AuthLayout
        title="Two-factor verification"
        subtitle="Enter the 6-digit code from your authenticator app, or one of your backup codes."
      >
        <form onSubmit={handleVerify} className="space-y-5" noValidate>
          {error && <Alert tone="red">{error}</Alert>}
          <Field label="Verification code" htmlFor="code">
            <input
              id="code"
              className="input text-center font-mono text-lg tracking-[0.4em]"
              inputMode="text"
              autoComplete="one-time-code"
              autoFocus
              maxLength={8}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase())}
            />
          </Field>
          <Button type="submit" className="w-full" size="lg" loading={submitting} disabled={code.length < 6}>
            Verify and sign in
          </Button>
          <button
            type="button"
            className="btn btn-ghost w-full"
            onClick={() => {
              setTempToken(null);
              setCode('');
              setError('');
            }}
          >
            <Icon name="arrowLeft" /> Use a different account
          </button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Welcome back. Sign in to manage your vehicles."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="link">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} className="space-y-5">
        {error && <Alert tone="red">{error}</Alert>}
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            className="input"
            autoComplete="email"
            autoFocus
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Password" htmlFor="password">
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="input pr-16"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </Field>
        <Button type="submit" className="w-full" size="lg" loading={submitting}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Login;
