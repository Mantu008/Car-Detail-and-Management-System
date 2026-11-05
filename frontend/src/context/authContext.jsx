import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api, { tokenStore } from '../config/api';
import { errorMessage } from '../utils/format';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // True only while restoring a saved session on first load.
  const [initializing, setInitializing] = useState(() => !!tokenStore.get());

  const startSession = useCallback(({ user: nextUser, token }) => {
    tokenStore.set(token);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  // Restore session.
  useEffect(() => {
    if (!tokenStore.get()) return;
    api
      .get('/api/users/profile')
      .then((res) => setUser(res.data.data))
      .catch(() => tokenStore.clear())
      .finally(() => setInitializing(false));
  }, []);

  // Session expired or account blocked while using the app.
  useEffect(() => {
    const onExpired = (e) => {
      setUser((current) => {
        if (current) toast.info(e.detail || 'Your session has ended. Please sign in again.');
        return null;
      });
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  /** Returns { ok, requires2FA?, tempToken?, message? } */
  const login = useCallback(
    async (email, password) => {
      try {
        const { data } = await api.post('/api/users/login', { email, password });
        if (data.data.requires2FA) return { ok: false, requires2FA: true, tempToken: data.data.tempToken };
        startSession(data.data);
        return { ok: true, user: data.data.user };
      } catch (error) {
        return { ok: false, message: errorMessage(error, 'Unable to sign in') };
      }
    },
    [startSession]
  );

  const verifyTwoFactor = useCallback(
    async (tempToken, code) => {
      try {
        const { data } = await api.post('/api/auth/2fa/validate', { tempToken, code });
        startSession(data.data);
        if (data.data.usedBackupCode) toast.info('Backup code used. Each code works only once.');
        return { ok: true, user: data.data.user };
      } catch (error) {
        return { ok: false, message: errorMessage(error, 'Verification failed') };
      }
    },
    [startSession]
  );

  const register = useCallback(
    async (name, email, password) => {
      try {
        const { data } = await api.post('/api/users/register', { name, email, password });
        startSession(data.data);
        return { ok: true, user: data.data.user };
      } catch (error) {
        return { ok: false, message: errorMessage(error, 'Unable to create account') };
      }
    },
    [startSession]
  );

  const value = useMemo(
    () => ({
      user,
      initializing,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login,
      verifyTwoFactor,
      register,
      logout,
      setUser,
    }),
    [user, initializing, login, verifyTwoFactor, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
