import { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';
import { loadJson } from '../lib/state.js';

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const read = () => setIncidents(loadJson('iscream.incidents', []));
    read();
    const timer = setInterval(read, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-slate-900">Incidents</h2>
      <Card title="Latest" tone="purple">
        {incidents.length === 0 ? (
          <p className="text-slate-600">No incidents yet. Trigger SOS to create one.</p>
        ) : (
          <div className="space-y-4">
            {incidents.map((i) => (
              <div key={i.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-black text-slate-900">{i.type} {i.id}</div>
                  <div className="text-xs font-semibold text-emerald-700">{i.status}</div>
                </div>
                <div className="text-sm text-slate-600 mt-1">{new Date(i.createdAt).toLocaleString()}</div>
                <div className="text-sm text-slate-700 mt-2">Location: {i.locationLabel}</div>
                <div className="text-sm text-slate-700 mt-2">
                  Recipients: {Array.isArray(i.recipients) ? i.recipients.map((r) => r.name).join(', ') : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
