import { useEffect, useState } from 'react';
import { MarketAPI } from '../api/client';

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState({ search: '', category: '' });
  const [form, setForm] = useState({ productName: '', category: 'grain', quantityAvailable: '', unit: 'kg', pricePerUnit: '', description: '' });

  const load = async () => {
    const d = await MarketAPI.listings(q).catch(() => ({ listings: [] }));
    setListings(d.listings || []);
    const o = await MarketAPI.myOrders().catch(() => ({ orders: [] }));
    setOrders(o.orders || []);
  };
  useEffect(() => { load(); }, []);

  const buy = async (id) => {
    const qty = prompt('Quantity?');
    if (!qty) return;
    await MarketAPI.order({ listingId: id, quantityOrdered: Number(qty) }).catch((e) => alert(e.message));
    load();
  };
  const sell = async (e) => {
    e.preventDefault();
    await MarketAPI.create({ ...form, quantityAvailable: Number(form.quantityAvailable), pricePerUnit: Number(form.pricePerUnit) }).catch((ex) => alert(ex.message));
    setForm({ productName: '', category: 'grain', quantityAvailable: '', unit: 'kg', pricePerUnit: '', description: '' });
    load();
  };

  return (
    <div>
      <h2>Marketplace</h2>
      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="card row">
        <input placeholder="Search" value={q.search} onChange={(e) => setQ({ ...q, search: e.target.value })} />
        <input placeholder="Category" value={q.category} onChange={(e) => setQ({ ...q, category: e.target.value })} />
        <button>Filter</button>
      </form>
      <div className="grid">
        {listings.map((l) => (
          <div key={l._id} className="card small">
            <b>{l.productName}</b> ({l.category})<br />{l.quantityAvailable} {l.unit} @ ₹{l.pricePerUnit}/{l.unit}<br />
            <button onClick={() => buy(l._id)}>Buy</button>
          </div>
        ))}
      </div>
      <h3>Sell yours</h3>
      <form onSubmit={sell} className="card">
        <div className="row">
          <input placeholder="Product" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} required />
          <input placeholder="Qty" value={form.quantityAvailable} onChange={(e) => setForm({ ...form, quantityAvailable: e.target.value })} required />
          <input placeholder="Price/unit" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })} required />
        </div>
        <button>List</button>
      </form>
      <h3>My Orders ({orders.length})</h3>
      {orders.map((o) => <div key={o._id} className="card small">{o.productName} x {o.quantityOrdered} — ₹{o.totalPrice} ({o.status})</div>)}
    </div>
  );
}
