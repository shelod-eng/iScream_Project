import { useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import { loadJson, saveJson } from '../lib/state.js';

function newId() {
  return `c_${Math.random().toString(16).slice(2)}`;
}

export default function Contacts() {
  const initial = useMemo(() => loadJson('iscream.contacts', []), []);
  const [contacts, setContacts] = useState(initial);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  function persist(next) {
    setContacts(next);
    saveJson('iscream.contacts', next);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-slate-900">Trusted Contacts</h2>
      <Card title="Add contact" tone="teal">
        <div className="grid md:grid-cols-3 gap-3">
          <input
            className="rounded-xl border border-slate-200 px-4 py-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          <input
            className="rounded-xl border border-slate-200 px-4 py-3"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
          />
          <button
            className="rounded-xl bg-[#0F8F7D] text-white px-4 py-3 text-sm font-bold"
            onClick={() => {
              const trimmedName = name.trim();
              const trimmedPhone = phone.trim();
              if (!trimmedName || !trimmedPhone) return;
              const next = [{ id: newId(), name: trimmedName, phone: trimmedPhone }, ...contacts].slice(0, 3);
              persist(next);
              setName('');
              setPhone('');
            }}
          >
            Add (max 3)
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-600">MVP enforces max 3 trusted contacts.</p>
      </Card>

      <Card title="Current contacts" tone="dark">
        {contacts.length === 0 ? (
          <p className="text-slate-600">No contacts yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {contacts.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900">{c.name}</div>
                  <div className="text-sm text-slate-600">{c.phone}</div>
                </div>
                <button
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => persist(contacts.filter((x) => x.id !== c.id))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
