import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try { await login(f.email, f.password); nav('/'); }
    catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  };
  return (
    <div className="auth-wrap">
      <div className="brandline">🌾</div>
      <div className="card">
        <h2>Welcome back</h2>
        <p>Log in to check mandi, weather & crops</p>
        <form onSubmit={submit}>
          <div><label className="f">Email</label><input placeholder="you@farm.in" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></div>
          <div><label className="f">Password</label><input type="password" placeholder="••••••••" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required /></div>
          {err && <p className="err">{err}</p>}
          <button disabled={busy}>{busy ? 'Logging in…' : 'Login'}</button>
        </form>
        <p>No account? <Link to="/register">Create one</Link></p>
      </div>
    </div>
  );
}
