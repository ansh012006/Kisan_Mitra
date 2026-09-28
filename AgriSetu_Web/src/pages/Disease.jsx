import { useEffect, useState } from 'react';
import { DiseaseAPI } from '../api/client';

export default function Disease() {
  const [file, setFile] = useState(null);
  const [res, setRes] = useState(null);
  const [hist, setHist] = useState([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const loadHist = () => DiseaseAPI.history().then((d) => setHist(d.analyses || [])).catch(() => {});
  useEffect(() => { loadHist(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true); setErr(''); setRes(null);
    try { setRes(await DiseaseAPI.analyze(file)); loadHist(); }
    catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <h2>Disease Detection</h2>
      <form onSubmit={submit} className="card row">
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        <button disabled={busy}>{busy ? 'Analyzing…' : 'Analyze'}</button>
      </form>
      {err && <p className="err">{err}</p>}
      {res?.analysis && (
        <div className="card">
          <h3>{res.analysis.isHealthy ? '✅ Healthy' : `🦠 ${res.analysis.diseaseName}`} ({res.analysis.confidence}%)</h3>
          <p><b>Crop:</b> {res.analysis.cropName} | <b>Severity:</b> {res.analysis.severity}</p>
          {(res.analysis.treatment || []).map((t, i) => <li key={i}>{t}</li>)}
        </div>
      )}
      <h3>History</h3>
      {hist.map((h) => <div key={h._id} className="card small">{h.cropName} — {h.isHealthy ? 'Healthy' : h.diseaseName} ({h.confidence}%)</div>)}
    </div>
  );
}
