import { useEffect, useState } from 'react';
import { CouponAPI, LandAPI } from '../api/client';

// ponytail: mirrors Android CouponsScreen; quick chips preset category=fertilizer
const QUICK = ['DAP', 'MOP', 'NPK', 'Urea'];

export default function Coupons() {
  const [limits, setLimits] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [lands, setLands] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [f, setF] = useState({ landId: '', product: 'DAP', quantity: '', crop: '' });
  const [land, setLand] = useState({ landName: '', areaValue: '', areaUnit: 'acre', state: '', district: '' });
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [l, c, li] = await Promise.all([
      LandAPI.list().catch(() => ({ lands: [] })),
      CouponAPI.mine().catch((e) => ({ error: e.message })),
      CouponAPI.myLimits().catch(() => ({ limits: [] })),
    ]);
    setLands(l.lands || []);
    if (!f.landId && l.lands?.length) setF((p) => ({ ...p, landId: l.lands[0]._id }));
    if (c.error) setErr(c.error);
    else setCoupons(c.coupons || []);
    setLimits(li.limits || []);
  };
  useEffect(() => { load(); }, []);

  const generate = async (e) => {
    e.preventDefault();
    setErr(''); setOk(''); setBusy(true);
    try {
      const d = await CouponAPI.generate({
        landId: f.landId, product: f.product.trim(), productCategory: 'fertilizer',
        quantityValue: Number(f.quantity), ...(f.crop.trim() ? { crop: f.crop.trim() } : {}),
      });
      setOk(`Coupon ${d.coupon.couponCode} generated — ${d.remainingQuota ?? ''} quota left`);
      setF((p) => ({ ...p, product: 'DAP', quantity: '', crop: '' }));
      setShowForm(false);
      load();
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  };

  const addLand = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await LandAPI.create({ ...land, areaValue: Number(land.areaValue) });
      setLand({ landName: '', areaValue: '', areaUnit: 'acre', state: '', district: '' });
      load();
    } catch (ex) { setErr(ex.message); }
  };

  const cancel = async (id) => {
    if (!confirm('Discard this coupon?')) return;
    await CouponAPI.cancel(id).catch((ex) => alert(ex.message));
    load();
  };

  return (
    <div>
      <h2>My Coupons</h2>
      <p className="page-sub">Generate a fertilizer subsidy coupon from your land eligibility, show the code at a dealer.</p>
      <button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '＋ Generate coupon'}</button>
      {err && <p className="err">{err}</p>}
      {ok && <p className="ok">{ok}</p>}

      {limits.length > 0 && (
        <div className="card">
          <h3>My subsidy limits</h3>
          {limits.map((l) => (
            <div key={l.ruleId} className="card small">
              <b>{l.product}</b> — <span className="pill">{l.remainingQuantity} {l.unit} left</span>
              <br />Used {l.totalAllocated} of {l.eligibleQuantity} {l.unit}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={generate} className="card">
          <h3>Generate (fertilizer)</h3>
          {lands.length === 0 ? (
            <p className="err">No land on file yet — add one below first.</p>
          ) : (
            <div><label className="f">Land</label>
              <select value={f.landId} onChange={(e) => setF({ ...f, landId: e.target.value })}>
                {lands.map((l) => <option key={l._id} value={l._id}>{l.landName} ({l.area?.value} {l.area?.unit})</option>)}
              </select>
            </div>
          )}
          <label className="f">Product</label>
          <div className="row">
            {QUICK.map((p) => (
              <button key={p} type="button" className={f.product === p ? '' : 'ghost'} onClick={() => setF({ ...f, product: p })}>{p}</button>
            ))}
          </div>
          <div><label className="f">Product name</label><input value={f.product} onChange={(e) => setF({ ...f, product: e.target.value })} required /></div>
          <div className="row">
            <div><label className="f">Qty (bags)</label><input value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} required /></div>
            <div><label className="f">Crop (optional)</label><input placeholder="Wheat" value={f.crop} onChange={(e) => setF({ ...f, crop: e.target.value })} /></div>
          </div>
          <br /><button disabled={busy || !f.landId}>{busy ? 'Generating…' : 'Generate coupon'}</button>
        </form>
      )}

      <h3>My coupons ({coupons.length})</h3>
      {coupons.map((c) => (
        <div key={c._id} className="card small">
          <b>{c.couponCode}</b> <span className="pill" style={c.status !== 'active' ? { background: '#fdecec', color: '#b71c1c' } : {}}>{c.status}</span>
          <br />{c.quantity?.value} {c.quantity?.unit} of {c.product} — expires {String(c.expiresAt || '').slice(0, 10)}
          {c.status === 'active' && <><br /><button className="ghost" onClick={() => cancel(c._id)}>Discard</button></>}
        </div>
      ))}

      <h3>Add land</h3>
      <form onSubmit={addLand} className="card">
        <div className="row">
          <input placeholder="Land name" value={land.landName} onChange={(e) => setLand({ ...land, landName: e.target.value })} required />
          <input placeholder="Area" value={land.areaValue} onChange={(e) => setLand({ ...land, areaValue: e.target.value })} required />
          <select value={land.areaUnit} onChange={(e) => setLand({ ...land, areaUnit: e.target.value })}>
            {['acre', 'hectare', 'bigha', 'guntha', 'sqft', 'sqm'].map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <input placeholder="State" value={land.state} onChange={(e) => setLand({ ...land, state: e.target.value })} />
          <input placeholder="District" value={land.district} onChange={(e) => setLand({ ...land, district: e.target.value })} />
          <button>Save land</button>
        </div>
      </form>
    </div>
  );
}
