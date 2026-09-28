// ponytail: fetch wrapper only, add axios/react-query if caching needed
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const token = () => localStorage.getItem('agrisetu_token');

export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  if (!form) headers['Content-Type'] = 'application/json';
  const t = token();
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: form ? body : body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

export const AuthAPI = {
  register: (b) => api('/auth/register', { method: 'POST', body: b }),
  login: (b) => api('/auth/login', { method: 'POST', body: b }),
  me: () => api('/auth/me'),
};

export const DiseaseAPI = {
  analyze: (file) => {
    const fd = new FormData();
    fd.append('cropImage', file);
    return api('/disease/analyze', { method: 'POST', body: fd, form: true });
  },
  history: () => api('/disease/history'),
};

export const MandiAPI = {
  prices: (q = {}) => {
    const clean = Object.fromEntries(Object.entries(q).map(([k, v]) => [k, String(v ?? '').trim()]).filter(([, v]) => v));
    const s = new URLSearchParams(clean).toString();
    return api(`/mandi/prices${s ? `?${s}` : ''}`);
  },
};

export const WeatherAPI = {
  get: (lat, lng) => api(`/weather?lat=${lat}&lng=${lng}`),
};

export const MarketAPI = {
  listings: (q = {}) => {
    const s = new URLSearchParams(q).toString();
    return api(`/marketplace/listings${s ? `?${s}` : ''}`);
  },
  create: (b) => api('/marketplace/listings', { method: 'POST', body: b }),
  mine: () => api('/marketplace/listings/mine'),
  order: (b) => api('/marketplace/orders', { method: 'POST', body: b }),
  myOrders: () => api('/marketplace/orders/mine'),
  received: () => api('/marketplace/orders/received'),
};

export const LandAPI = {
  list: () => api('/lands'),
  create: (b) => api('/lands', { method: 'POST', body: b }),
};

export const CouponAPI = {
  mine: () => api('/coupons/mine'),
  myLimits: () => api('/coupons/my-limits'),
  generate: (b) => api('/coupons', { method: 'POST', body: b }),
  cancel: (id) => api(`/coupons/${id}/cancel`, { method: 'PATCH' }),
  lookup: (code) => api(`/coupons/lookup/${encodeURIComponent(code)}`),
  redeem: (code) => api('/coupons/redeem', { method: 'POST', body: { couponCode: code } }),
};
