import { useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import { loadJson, saveJson } from '../lib/state.js';

export default function Register() {
  const existing = useMemo(() => loadJson('iscream.profile', null), []);
  const [fullName, setFullName] = useState(existing?.fullName ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-slate-900">Register (Demo)</h2>
      <Card title="Profile" tone="primary">
        <div className="grid md:grid-cols-2 gap-4">
          <label className="text-sm font-semibold text-slate-700">
            Full name
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Phone
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0821234567"
            />
          </label>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            className="rounded-xl bg-[#0E3F91] text-white px-4 py-2 text-sm font-bold"
            onClick={() => {
              saveJson('iscream.profile', { fullName: fullName.trim(), phone: phone.trim() });
              setSaved(true);
              setTimeout(() => setSaved(false), 1200);
            }}
          >
            Save
          </button>
          {saved ? <span className="text-sm font-semibold text-emerald-700">Saved</span> : null}
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Demo registration. MVP will be backed by Auth and verified phone.
        </p>
      </Card>
    </div>
  );
}
