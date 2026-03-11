import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card.jsx';
import PhoneMockup from '../components/PhoneMockup.jsx';
import { getActiveIncident } from '../lib/state.js';

function pad2(n) {
  return String(Math.max(0, Math.floor(n))).padStart(2, '0');
}

function formatMMSS(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${pad2(minutes)}:${pad2(seconds)}`;
}

export default function AppDemo() {
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const active = getActiveIncident();
  const activeSeconds = active ? Math.max(0, Math.floor((nowMs - new Date(active.createdAt).getTime()) / 1000)) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">iScream Interactive Prototype</h1>
          <p className="text-slate-600 mt-2">
            Tomorrow’s demo: register, set contacts, trigger SOS (hold), and review incidents in admin.
          </p>
        </div>
        <div className="rounded-2xl bg-[#0E3F91] text-white px-5 py-4 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-white/70">Demo focus</div>
          <div className="text-lg font-bold">Core SOS workflow</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[420px_1fr] gap-8 items-start">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Link className="rounded-xl bg-[#1C66B8] text-white px-4 py-2 text-sm font-black" to="/register">
              Start: Register
            </Link>
            <Link className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold" to="/contacts">
              Set Contacts
            </Link>
          </div>

          <Card title="Logged in as" tone="green">
            <div className="text-slate-900 font-black text-lg">Demo User</div>
            <div className="text-slate-600 text-sm">Johannesburg, basic</div>
          </Card>

          <div className="grid gap-3">
            <Link className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 font-bold text-red-700" to="/sos">
              Hold SOS to trigger an emergency
            </Link>
            <button className="rounded-2xl border border-purple-200 bg-purple-50 px-4 py-4 font-bold text-purple-700" type="button">
              Try Silent Alert for discreet mode
            </button>
            <button className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4 font-bold text-blue-700" type="button">
              Submit a non-emergency report
            </button>
            <Link className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 font-bold text-emerald-700" to="/contacts">
              Add and manage emergency contacts
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link className="rounded-xl bg-[#0E3F91] text-white px-4 py-3 text-sm font-black text-center" to="/dashboard">
              Dashboard
            </Link>
            <Link className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-center" to="/register">
              Register
            </Link>
          </div>

          {active ? (
            <div className="rounded-2xl bg-[#D82E2E] text-white px-5 py-5 shadow-sm">
              <div className="text-xs font-black tracking-widest opacity-95">EMERGENCY ACTIVE</div>
              <div className="text-lg font-black mt-2">{active.type}</div>
              <div className="text-3xl font-black mt-4">{formatMMSS(activeSeconds)}</div>
            </div>
          ) : null}

          <div className="text-xs text-slate-500">
            Note: demo uses local storage. Backend will replace this.
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <PhoneMockup />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Card title="Citizen or User" tone="primary">
          <ul className="list-disc pl-5 text-slate-700 space-y-1">
            <li>Register and login</li>
            <li>Trigger SOS alert</li>
            <li>Manage trusted contacts</li>
            <li>Share location</li>
          </ul>
        </Card>
        <Card title="Admin or Operator" tone="purple">
          <ul className="list-disc pl-5 text-slate-700 space-y-1">
            <li>Monitor active incidents</li>
            <li>Update incident status</li>
            <li>Basic incident metrics</li>
            <li>Export later (Phase 2)</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

