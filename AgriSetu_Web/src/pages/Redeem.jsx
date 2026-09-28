import { useState } from 'react';
import { CouponAPI } from '../api/client';

// ponytail: mirrors Android RedeemCouponScreen (dealer / agri_officer only)
export default function Redeem() {
  const [code, setCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [err, setErr] = useState('');
  const [done, setDone] = useState('');
  const [busy, setBusy] = useState(false);

  const lookup = async (e) => {
    e?.preventDefault();
    setErr(''); setDone(''); setCoupon(null); setBusy(true);
    try {
      const d = await CouponAPI.lookup(code.trim().toUpperCase());
      setCoupon(d.coupon);
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  };

  const redeem = async () => {
    setErr(''); setDone(''); setBusy(true);
    try {
      await CouponAPI.redeem(coupon.couponCode);
      setDone(`Redeemed ${coupon.quantity?.value} ${coupon.quantity?.unit} of ${coupon.product} for ${coupon.farmer?.name || 'farmer'}.`);
      setCoupon({ ...coupon, status: 'redeemed' });
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <h2>Redeem a coupon</h2>
      <p className="page-sub">Enter the code the farmer shows you to verify, then confirm the fertilizer handover.</p>
      <form onSubmit={lookup} className="card row">
        <input placeholder="AGRI-XXXX-XXXX" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
        <button disabled={busy || !code.trim()}>{busy ? '…' : 'Look up'}</button>
      </form>
      {err && <p className="err">{err}</p>}
      {done && <p className="ok">{done}</p>}
      {coupon && (
        <div className="card">
          <h3>{coupon.couponCode} <span className="pill">{coupon.status}</span></h3>
          <p><b>Farmer:</b> {coupon.farmer?.name || '—'} | <b>Product:</b> {coupon.product} ({coupon.productCategory})</p>
          <p><b>Qty:</b> {coupon.quantity?.value} {coupon.quantity?.unit} | <b>Land:</b> {coupon.land?.landName || '—'} | <b>Expires:</b> {String(coupon.expiresAt || '').slice(0, 10)}</p>
          {coupon.status === 'active' && <button disabled={busy} onClick={redeem}>{busy ? 'Redeeming…' : 'Confirm & redeem'}</button>}
        </div>
      )}
    </div>
  );
}
