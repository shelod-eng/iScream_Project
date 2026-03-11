import { useEffect, useMemo, useRef, useState } from 'react';
import { createIncident, getActiveIncident, loadJson, setActiveIncidentId, updateIncidentStatus } from '../lib/state.js';

const EMERGENCY_TYPES = [
  { key: 'police', label: 'Police', color: '#1C66B8' },
  { key: 'medical', label: 'Medical', color: '#0F8F7D' },
  { key: 'fire', label: 'Fire', color: '#4C4ACF' },
  { key: 'crime', label: 'Crime', color: '#1C8F3A' },
];

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function pad2(n) {
  return String(Math.max(0, Math.floor(n))).padStart(2, '0');
}

function formatMMSS(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${pad2(minutes)}:${pad2(seconds)}`;
}

function timelineFromElapsed(elapsedSeconds) {
  return {
    alertSent: true,
    dispatchNotified: elapsedSeconds >= 5,
    responderAssigned: elapsedSeconds >= 20,
    responderEnRoute: elapsedSeconds >= 60,
    responderArrived: elapsedSeconds >= 120,
  };
}

function TimelineRow({ done, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center border ${
            done ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300 text-slate-400'
          }`}
        >
          {done ? '✓' : ''}
        </div>
      </div>
      <div className="flex-1">
        <div className={`font-bold ${done ? 'text-slate-900' : 'text-slate-400'}`}>{title}</div>
        <div className={`text-xs ${done ? 'text-slate-500' : 'text-slate-300'}`}>{subtitle}</div>
      </div>
    </div>
  );
}

export default function PhoneMockup() {
  const profile = useMemo(() => loadJson('iscream.profile', { fullName: 'Demo User', phone: '0820000000' }), []);
  const [selectedType, setSelectedType] = useState(EMERGENCY_TYPES[0]);
  const [locationLabel] = useState('Rosebank, Johannesburg');
  const [holdProgress, setHoldProgress] = useState(0);
  const [statusText, setStatusText] = useState('Hold 3s');
  const [tab, setTab] = useState('home');
  const [nowMs, setNowMs] = useState(Date.now());

  const holdStartRef = useRef(null);
  const rafRef = useRef(null);
  const holdingRef = useRef(false);

  const HOLD_MS = 3000;

  function stopRaf() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  function resetHold() {
    holdingRef.current = false;
    holdStartRef.current = null;
    setHoldProgress(0);
    setStatusText('Hold 3s');
    stopRaf();
  }

  function tick() {
    if (!holdingRef.current || !holdStartRef.current) return;
    const elapsed = Date.now() - holdStartRef.current;
    const p = clamp01(elapsed / HOLD_MS);
    setHoldProgress(p);

    if (p >= 1) {
      holdingRef.current = false;
      stopRaf();
      const incident = createIncident({ type: selectedType.label, locationLabel });
      setStatusText(`Sent: ${incident.id}`);
      setTab('status');
      setTimeout(() => resetHold(), 1400);
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }

  function startHold() {
    if (holdingRef.current) return;
    holdingRef.current = true;
    holdStartRef.current = Date.now();
    setStatusText('Holding...');
    rafRef.current = requestAnimationFrame(tick);
  }

  function cancelHold() {
    if (!holdingRef.current) return;
    resetHold();
  }

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => () => stopRaf(), []);

  const activeIncident = getActiveIncident();
  const elapsedSeconds = activeIncident
    ? Math.max(0, Math.floor((nowMs - new Date(activeIncident.createdAt).getTime()) / 1000))
    : 0;
  const timeline = timelineFromElapsed(elapsedSeconds);
  const etaSeconds = Math.max(0, 240 - elapsedSeconds);

  const ringDeg = Math.round(holdProgress * 360);
  const ringStyle = {
    background: `conic-gradient(${selectedType.color} ${ringDeg}deg, rgba(255,255,255,0.15) 0deg)`,
  };

  const contacts = loadJson('iscream.contacts', []);

  function cancelEmergency() {
    if (!activeIncident) return;
    updateIncidentStatus(activeIncident.id, 'cancelled');
    setActiveIncidentId(null);
    setStatusText('Cancelled');
    setTimeout(() => {
      setTab('home');
      resetHold();
    }, 600);
  }

  function TabButton({ id, children }) {
    const active = tab === id;
    return (
      <button
        className={`px-2 py-1 rounded-xl text-[11px] font-bold ${
          active ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'
        }`}
        onClick={() => setTab(id)}
        type="button"
      >
        {children}
      </button>
    );
  }

  function ScreenHome() {
    return (
      <>
        <div className="bg-[#1C66B8] text-white px-5 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold opacity-90">Welcome back.</div>
            <div className="text-xs font-semibold">Protected</div>
          </div>
          <div className="text-xl font-black mt-1 leading-tight">{profile.fullName || 'Demo User'}</div>

          <div className="mt-4 rounded-2xl bg-white/15 px-4 py-3 flex items-center justify-between">
            <div className="text-sm font-semibold">{locationLabel}</div>
            <div className="w-2 h-2 rounded-full bg-emerald-300" />
          </div>
        </div>

        <div className="px-5 py-5">
          <div className="text-xs font-bold tracking-widest text-slate-500">SELECT EMERGENCY TYPE</div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {EMERGENCY_TYPES.map((t) => {
              const active = t.key === selectedType.key;
              return (
                <button
                  key={t.key}
                  className={`rounded-2xl border px-2 py-3 text-xs font-extrabold transition-all ${
                    active ? 'border-slate-900/10 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                  }`}
                  style={active ? { boxShadow: `0 0 0 2px ${t.color} inset` } : undefined}
                  onClick={() => setSelectedType(t)}
                  type="button"
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-center">
            <div className="w-[210px] h-[210px] rounded-full p-2" style={ringStyle}>
              <button
                className="w-full h-full rounded-full bg-[#D82E2E] text-white flex flex-col items-center justify-center shadow-lg active:scale-[0.99]"
                onMouseDown={startHold}
                onMouseUp={cancelHold}
                onMouseLeave={cancelHold}
                onTouchStart={(e) => {
                  e.preventDefault();
                  startHold();
                }}
                onTouchEnd={cancelHold}
                onTouchCancel={cancelHold}
                aria-label="Hold to trigger SOS"
                type="button"
              >
                <div className="text-sm font-black opacity-90">SOS</div>
                <div className="text-4xl font-black tracking-wide">SOS</div>
                <div className="text-xs font-bold opacity-90">{statusText}</div>
              </button>
            </div>
          </div>

          <div className="mt-7">
            <div className="text-xs font-bold tracking-widest text-slate-500">QUICK ACTIONS</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                className="rounded-2xl border border-slate-200 bg-[#F7F7FF] px-4 py-4 text-left"
                onClick={() => {
                  const incident = createIncident({ type: 'Silent Alert', locationLabel });
                  setStatusText(`Sent: ${incident.id}`);
                  setTab('status');
                  setTimeout(() => resetHold(), 1400);
                }}
                type="button"
              >
                <div className="text-sm font-black text-[#4C4ACF]">Silent Alert</div>
                <div className="text-xs text-slate-500">Discreet panic</div>
              </button>
              <button
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left"
                onClick={() => {
                  navigator.clipboard?.writeText(`iScream location: ${locationLabel}`).catch(() => {});
                  setStatusText('Location copied');
                  setTimeout(() => resetHold(), 1400);
                }}
                type="button"
              >
                <div className="text-sm font-black text-slate-900">Share Location</div>
                <div className="text-xs text-slate-500">Send to contacts</div>
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <a className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left" href="tel:10111">
              <div className="text-sm font-black text-slate-900">Call 10111</div>
              <div className="text-xs text-slate-500">SAPS direct</div>
            </a>
            <a className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left" href="tel:10177">
              <div className="text-sm font-black text-slate-900">Call 10177</div>
              <div className="text-xs text-slate-500">EMS direct</div>
            </a>
          </div>
        </div>
      </>
    );
  }

  function ScreenStatus() {
    if (!activeIncident) {
      return (
        <>
          <div className="bg-[#0E3F91] text-white px-5 pt-5 pb-4">
            <div className="text-xs font-black tracking-widest">STATUS</div>
            <div className="text-xl font-black mt-2">No active emergency</div>
            <div className="text-sm text-white/80 mt-1">Trigger SOS to start an incident.</div>
          </div>
          <div className="px-5 py-6">
            <button
              className="w-full rounded-2xl bg-[#1C66B8] text-white px-4 py-3 text-sm font-black"
              onClick={() => setTab('home')}
              type="button"
            >
              Go to Home
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="bg-[#D82E2E] text-white px-5 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white" />
              <div className="text-xs font-black tracking-widest">EMERGENCY ACTIVE</div>
            </div>
            <div className="text-xs font-bold">{formatMMSS(elapsedSeconds)}</div>
          </div>

          <div className="mt-3 text-2xl font-black leading-tight">{activeIncident.type}</div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/15 px-4 py-3">
              <div className="text-xs font-semibold opacity-90">Duration</div>
              <div className="text-2xl font-black mt-1">{formatMMSS(elapsedSeconds)}</div>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3">
              <div className="text-xs font-semibold opacity-90">Responder ETA</div>
              <div className="text-2xl font-black mt-1">{timeline.responderArrived ? 'On Scene' : formatMMSS(etaSeconds)}</div>
            </div>
          </div>
        </div>

        <div className="px-5 py-5">
          {timeline.responderAssigned ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1C66B8] text-white flex items-center justify-center font-black">47</div>
                <div>
                  <div className="font-black text-slate-900">Unit 47 - Sandton SAPS</div>
                  <div className="text-xs text-slate-500">Officer: Themba Nkosi</div>
                  <div className="text-xs text-slate-500">Vehicle: GP 123-456</div>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          ) : null}

          <div className="text-xs font-bold tracking-widest text-slate-500">RESPONSE TIMELINE</div>
          <div className="mt-4 space-y-4">
            <TimelineRow done={timeline.alertSent} title="Alert Sent" subtitle="Emergency transmitted" />
            <TimelineRow done={timeline.dispatchNotified} title="Dispatch Notified" subtitle="Control room received alert" />
            <TimelineRow done={timeline.responderAssigned} title="Responder Assigned" subtitle="Unit 47 - Sandton" />
            <TimelineRow done={timeline.responderEnRoute} title="Responder En Route" subtitle="ETA approx. 4 minutes" />
            <TimelineRow done={timeline.responderArrived} title="Responder Arrived" subtitle="On scene" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black"
              onClick={() => updateIncidentStatus(activeIncident.id, 'resolved')}
              type="button"
            >
              Mark Resolved
            </button>
            <button
              className="rounded-2xl border-2 border-[#D82E2E] text-[#D82E2E] px-4 py-3 text-xs font-black"
              onClick={cancelEmergency}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      </>
    );
  }

  function ScreenContacts() {
    return (
      <>
        <div className="bg-[#0F8F7D] text-white px-5 pt-5 pb-4">
          <div className="text-xs font-black tracking-widest">CONTACTS</div>
          <div className="text-xl font-black mt-2">Trusted contacts</div>
          <div className="text-sm text-white/80 mt-1">Max 3 for MVP</div>
        </div>
        <div className="px-5 py-5 space-y-3">
          {contacts.length === 0 ? (
            <div className="text-sm text-slate-600">No contacts yet.</div>
          ) : (
            contacts.slice(0, 3).map((c) => (
              <div key={c.id ?? c.phone} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="font-black text-slate-900">{c.name}</div>
                <div className="text-sm text-slate-500 mt-1">{c.phone}</div>
                <div className="mt-3 flex gap-2">
                  <a className="rounded-xl bg-[#0F8F7D] text-white px-3 py-2 text-xs font-black" href={`tel:${c.phone}`}>
                    Call
                  </a>
                  <button
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black"
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(String(c.phone)).catch(() => {});
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </>
    );
  }

  function ScreenProfile() {
    return (
      <>
        <div className="bg-[#4C4ACF] text-white px-5 pt-5 pb-4">
          <div className="text-xs font-black tracking-widest">PROFILE</div>
          <div className="text-xl font-black mt-2">{profile.fullName || 'Demo User'}</div>
          <div className="text-sm text-white/80 mt-1">{profile.phone || '0820000000'}</div>
        </div>
        <div className="px-5 py-6">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <div className="text-sm font-black text-slate-900">Privacy note</div>
            <div className="text-sm text-slate-600 mt-2">
              MVP uses explicit consent and logs only the minimum incident data.
            </div>
          </div>
        </div>
      </>
    );
  }

  function ScreenReport() {
    return (
      <>
        <div className="bg-[#1C8F3A] text-white px-5 pt-5 pb-4">
          <div className="text-xs font-black tracking-widest">REPORT</div>
          <div className="text-xl font-black mt-2">Non-emergency report</div>
          <div className="text-sm text-white/80 mt-1">Placeholder for MVP</div>
        </div>
        <div className="px-5 py-6">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <div className="text-sm text-slate-600">We’ll implement report submission in Phase 1 MVP.</div>
            <button
              className="mt-4 w-full rounded-2xl bg-[#0E3F91] text-white px-4 py-3 text-sm font-black"
              onClick={() => setTab('home')}
              type="button"
            >
              Back to Home
            </button>
          </div>
        </div>
      </>
    );
  }

  let content = null;
  if (tab === 'home') content = <ScreenHome />;
  else if (tab === 'status') content = <ScreenStatus />;
  else if (tab === 'contacts') content = <ScreenContacts />;
  else if (tab === 'profile') content = <ScreenProfile />;
  else content = <ScreenReport />;

  return (
    <div className="relative">
      <div className="absolute -inset-8 bg-gradient-to-br from-blue-200/30 via-transparent to-emerald-200/30 blur-2xl" />

      <div className="relative mx-auto w-[320px] sm:w-[360px]">
        <div className="rounded-[42px] bg-slate-950 p-[10px] shadow-2xl">
          <div className="rounded-[34px] bg-white overflow-hidden">
            {content}

            <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 flex items-center justify-between">
              <TabButton id="home">Home</TabButton>
              <TabButton id="status">Status</TabButton>
              <TabButton id="report">Report</TabButton>
              <TabButton id="contacts">Contacts</TabButton>
              <TabButton id="profile">Profile</TabButton>
            </div>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 top-[10px] w-[140px] h-[24px] rounded-b-2xl bg-slate-950" />
      </div>
    </div>
  );
}

