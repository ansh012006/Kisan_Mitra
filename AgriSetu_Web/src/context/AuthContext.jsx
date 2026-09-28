import { createContext, useContext, useEffect, useState } from 'react';
import { AuthAPI } from '../api/client';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('agrisetu_token')) return setLoading(false);
    AuthAPI.me().then((d) => setUser(d.user)).catch(() => localStorage.removeItem('agrisetu_token')).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const d = await AuthAPI.login({ email, password });
    localStorage.setItem('agrisetu_token', d.token);
    setUser(d.user);
  };
  const register = async (payload) => {
    const d = await AuthAPI.register(payload);
    localStorage.setItem('agrisetu_token', d.token);
    setUser(d.user);
  };
  const logout = () => {
    localStorage.removeItem('agrisetu_token');
    setUser(null);
  };
  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
}
