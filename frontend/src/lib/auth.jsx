import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getStoredAuth, setStoredAuth } from './api';

const AuthContext = createContext(null);

/**
 * Who is signed in. The token and user live in localStorage (same idea as the
 * current site) and are re-checked against the API once on load, so a stale
 * token signs the visitor out instead of failing every request.
 */
export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (auth?.token) {
        try { await api.get('/auth/user-auth'); } catch (e) { if (!cancelled && (e.status === 401 || e.status === 403)) { setStoredAuth(null); setAuth(null); } }
      }
      if (!cancelled) setReady(true);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = useCallback((next) => { setStoredAuth(next); setAuth(next); }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.post('/auth/login', { email, password }, { auth: false });
    save({ token: data.token, user: data.user });
    return data.user;
  }, [save]);

  const register = useCallback(async (fields) => {
    await api.post('/auth/register', fields, { auth: false });
    return login(fields.email, fields.password);
  }, [login]);

  // the API ends this session too (the token stops working at once), then this browser forgets it
  const logout = useCallback(() => {
    api.post('/auth/logout').catch(() => { /* already ended or offline: signed out here anyway */ });
    save(null);
  }, [save]);
  const updateUser = useCallback((user) => setAuth((prev) => { const next = { ...prev, user: { ...prev?.user, ...user } }; setStoredAuth(next); return next; }), []);
  // a password change ends every other session and hands this one a fresh token
  const replaceToken = useCallback((token) => { if (token) setAuth((prev) => { const next = { ...prev, token }; setStoredAuth(next); return next; }); }, []);

  const value = useMemo(() => ({ user: auth?.user ?? null, token: auth?.token ?? null, ready, login, register, logout, updateUser, replaceToken }), [auth, ready, login, register, logout, updateUser, replaceToken]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
