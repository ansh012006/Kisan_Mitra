import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'farmer', phone: '', state: '', district: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try { await register(f); nav('/'); }
    catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  };
  return (
    <div className="auth-wrap">
      <div className="brandline">🌾</div>
      <div className="card">
        <h2>Join AgriSetu</h2>
        <p>One account for mandi, weather & market</p>
        <form onSubmit={submit}>
          <div><label className="f">Name</label><input placeholder="Your name" value={f.name} onChange={set('name')} required /></div>
          <div><label className="f">Email</label><input placeholder="you@farm.in" value={f.email} onChange={set('email')} required /></div>
          <div><label className="f">Password</label><input type="password" placeholder="Min 8 characters" value={f.password} onChange={set('password')} required /></div>
          <div><label className="f">I am a</label><select value={f.role} onChange={set('role')}>
            <option value="farmer">Farmer</option>
            <option value="buyer">Buyer</option>
            <option value="dealer">Dealer</option>
            <option value="machinery_owner">Machinery owner</option>
          </select></div>
          <div><label className="f">Phone (optional)</label><input placeholder="98XXXXXXXX" value={f.phone} onChange={set('phone')} /></div>
          <div><label className="f">State / District (optional)</label><input placeholder="State" value={f.state} onChange={set('state')} /></div>
          <div><input placeholder="District" value={f.district} onChange={set('district')} /></div>
          {err && <p className="err">{err}</p>}
          <button disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        </form>
        <p>Have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}
