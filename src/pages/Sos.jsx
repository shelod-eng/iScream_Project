import { useState } from 'react';
import Card from '../components/Card.jsx';
import { createIncident } from '../lib/state.js';

export default function Sos() {
  const [status, setStatus] = useState(null);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-slate-900">SOS</h2>
      <Card title="Trigger alert" tone="primary">
        <p className="text-slate-600">
          Demo mode: clicking the button creates an incident and marks it as sent to your trusted contacts.
        </p>
        <div className="mt-5 flex items-center gap-4">
          <button
            className="rounded-2xl bg-[#1C66B8] text-white px-6 py-4 text-sm font-black tracking-wide hover:brightness-110"
            onClick={() => {
              const incident = createIncident({ type: 'SOS', locationLabel: 'Johannesburg, Gauteng' });
              setStatus(`Incident ${incident.id} created and sent.`);
            }}
          >
            TRIGGER SOS
          </button>
          {status ? <span className="text-sm font-semibold text-emerald-700">{status}</span> : null}
        </div>
      </Card>
    </div>
  );
}
