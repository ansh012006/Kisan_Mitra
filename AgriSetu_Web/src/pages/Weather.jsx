import { useState } from 'react';
import { WeatherAPI } from '../api/client';

export default function Weather() {
  const [c, setC] = useState({ lat: '28.61', lng: '77.20' });
  const [w, setW] = useState(null);
  const [err, setErr] = useState('');
  const load = async (e) => {
    e?.preventDefault();
    setErr('');
    try { setW((await WeatherAPI.get(c.lat, c.lng)).weather); }
    catch (ex) { setErr(ex.message); }
  };
  return (
    <div>
      <h2>Weather</h2>
      <form onSubmit={load} className="card row">
        <input value={c.lat} onChange={(e) => setC({ ...c, lat: e.target.value })} placeholder="Lat" />
        <input value={c.lng} onChange={(e) => setC({ ...c, lng: e.target.value })} placeholder="Lng" />
        <button>Get</button>
      </form>
      {err && <p className="err">{err}</p>}
      {w && (
        <div className="card">
          <h3>{w.temperature}°C — {w.description} ({w.condition})</h3>
          <p>Humidity {w.humidity}% | Wind {w.windSpeed} km/h | Rain {w.precipitation}mm | {w.locationName}</p>
          <div className="grid">{(w.forecast || []).map((f) => <div key={f.date} className="card small">{f.date}<br />{f.minTemperature}° / {f.maxTemperature}°<br />🌧 {f.precipitationProbability}%</div>)}</div>
        </div>
      )}
    </div>
  );
}
