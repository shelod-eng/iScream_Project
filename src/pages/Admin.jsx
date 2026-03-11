import { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';
import { loadJson, saveJson } from '../lib/state.js';

export default function Admin() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const read = () => setIncidents(loadJson('iscream.incidents', []));
    read();
    const timer = setInterval(read, 1000);
    return () => clearInterval(timer);
  }, []);

  function updateStatus(id, status) {
    const next = incidents.map((i) => (i.id === id ? { ...i, status } : i));
    setIncidents(next);
    saveJson('iscream.incidents', next);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-slate-900">Dashboard (Demo)</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <Card title="Total incidents" tone="dark">
          <div className="text-3xl font-black">{incidents.length}</div>
          <div className="text-sm text-slate-600 mt-1">Local demo data</div>
        </Card>
        <Card title="Open" tone="teal">
          <div className="text-3xl font-black">{incidents.filter((i) => i.status !== 'resolved').length}</div>
          <div className="text-sm text-slate-600 mt-1">Not resolved</div>
        </Card>
        <Card title="Resolved" tone="green">
          <div className="text-3xl font-black">{incidents.filter((i) => i.status === 'resolved').length}</div>
          <div className="text-sm text-slate-600 mt-1">Closed cases</div>
        </Card>
      </div>

      <Card title="Incident queue" tone="purple">
        {incidents.length === 0 ? (
          <p className="text-slate-600">No incidents yet.</p>
        ) : (
          <div className="space-y-3">
            {incidents.map((i) => (
              <div key={i.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-black text-slate-900">{i.type} {i.id}</div>
                  <div className="text-xs font-semibold text-slate-700">{new Date(i.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-sm text-slate-700 mt-2">Location: {i.locationLabel}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold" onClick={() => updateStatus(i.id, 'investigating')}>Investigating</button>
                  <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold" onClick={() => updateStatus(i.id, 'dispatched')}>Dispatched</button>
                  <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold" onClick={() => updateStatus(i.id, 'resolved')}>Resolved</button>
                </div>
                <div className="text-sm font-semibold text-emerald-700 mt-2">Status: {i.status}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
