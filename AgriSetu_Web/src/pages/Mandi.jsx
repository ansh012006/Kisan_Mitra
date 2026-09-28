import { useEffect, useState } from 'react';
import { MandiAPI } from '../api/client';

// ponytail: local sample so table never empty if live returns 0; drop when backend demo fallback deploys
const today = new Date().toISOString().slice(0, 10);
const SAMPLE = [
  { market: 'Azadpur Mandi', commodity: 'Wheat', state: 'Delhi', district: 'Delhi', minPrice: 2050, maxPrice: 2200, modalPrice: 2125, arrivalDate: today },
  { market: 'Ludhiana Mandi', commodity: 'Wheat', state: 'Punjab', district: 'Ludhiana', minPrice: 2100, maxPrice: 2250, modalPrice: 2175, arrivalDate: today },
  { market: 'Indore Mandi', commodity: 'Soybean', state: 'Madhya Pradesh', district: 'Indore', minPrice: 4200, maxPrice: 4500, modalPrice: 4350, arrivalDate: today },
  { market: 'Nashik Mandi', commodity: 'Onion', state: 'Maharashtra', district: 'Nashik', minPrice: 1200, maxPrice: 1800, modalPrice: 1500, arrivalDate: today },
];

export default function Mandi() {
  const [f, setF] = useState({ commodity: '', state: '', district: '' });
  const [rows, setRows] = useState(SAMPLE);
  const [info, setInfo] = useState('Sample prices — search to refresh live');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const load = async (e) => {
    e?.preventDefault();
    setBusy(true);
    const clean = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v));
    try {
      const d = await MandiAPI.prices(clean);
      const list = d.records?.length ? d.records : SAMPLE;
      setRows(list);
      setInfo(!d.records?.length ? 'No live match — showing sample prices' : d.isDemoData ? 'Demo data (live API unavailable)' : `Live: ${d.source}`);
    } catch (ex) {
      setRows(SAMPLE);
      setInfo(`Server unreachable — showing sample prices (${ex.message})`);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => { load(); }, []);
  return (
    <div>
      <h2>Mandi Prices</h2>
      <form onSubmit={load} className="card row">
        <input placeholder="Commodity (optional)" value={f.commodity} onChange={set('commodity')} />
        <input placeholder="State (optional)" value={f.state} onChange={set('state')} />
        <input placeholder="District (optional)" value={f.district} onChange={set('district')} />
        <button disabled={busy}>{busy ? '…' : 'Search'}</button>
      </form>
      <p>{info}</p>
      <table><thead><tr><th>Market</th><th>Commodity</th><th>Min</th><th>Max</th><th>Modal</th><th>Date</th></tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}><td>{r.market}</td><td>{r.commodity}</td><td>{r.minPrice}</td><td>{r.maxPrice}</td><td>{r.modalPrice}</td><td>{r.arrivalDate}</td></tr>)}</tbody></table>
    </div>
  );
}
