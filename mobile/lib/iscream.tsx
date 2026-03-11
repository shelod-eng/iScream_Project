import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type IncidentType = 'POLICE' | 'MEDICAL' | 'FIRE' | 'CRIME' | 'OTHER';
export type IncidentStatus = 'ACTIVE' | 'RESOLVED' | 'CANCELLED';

export type IncidentEventKind =
  | 'ALERT_SENT'
  | 'DISPATCH_NOTIFIED'
  | 'RESPONDER_ASSIGNED'
  | 'RESPONDER_EN_ROUTE'
  | 'RESPONDER_ARRIVED'
  | 'RESOLVED'
  | 'CANCELLED'
  | 'NOTE';

export type IncidentEvent = {
  id: string;
  kind: IncidentEventKind;
  label: string;
  detail?: string;
  at: number;
  done: boolean;
};

export type Incident = {
  id: string;
  type: IncidentType;
  status: IncidentStatus;
  startedAt: number;
  resolvedAt?: number;
  responderEtaText: string;
  responderUnitText: string;
  events: IncidentEvent[];
};

type Profile = {
  fullName: string;
  locationText: string;
};

type IscreamContextValue = {
  profile: Profile;
  selectedType: IncidentType;
  setSelectedType: (t: IncidentType) => void;
  activeIncident: Incident | null;
  incidents: Incident[];
  startIncident: () => void;
  cancelActive: () => void;
  resolveActive: () => void;
};

const IscreamContext = createContext<IscreamContextValue | null>(null);

function id() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function makeTimeline(now: number): IncidentEvent[] {
  return [
    { id: id(), kind: 'ALERT_SENT', label: 'Alert Sent', detail: 'Emergency transmitted', at: now, done: true },
    { id: id(), kind: 'DISPATCH_NOTIFIED', label: 'Dispatch Notified', detail: 'Control room received alert', at: now + 8000, done: false },
    { id: id(), kind: 'RESPONDER_ASSIGNED', label: 'Responder Assigned', detail: 'Unit 47 — Sandton SAPS', at: now + 20000, done: false },
    { id: id(), kind: 'RESPONDER_EN_ROUTE', label: 'Responder En Route', detail: 'ETA approx. 4 minutes', at: now + 40000, done: false },
    { id: id(), kind: 'RESPONDER_ARRIVED', label: 'Responder Arrived', detail: 'On scene', at: now + 70000, done: false },
  ];
}

export function IscreamProvider({ children }: { children: React.ReactNode }) {
  const [selectedType, setSelectedType] = useState<IncidentType>('POLICE');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const profile = useMemo<Profile>(
    () => ({ fullName: 'Demo User', locationText: 'Rosebank, Johannesburg' }),
    []
  );

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setIncidents((prev) => {
        const now = Date.now();
        return prev.map((inc) => {
          if (inc.status !== 'ACTIVE') return inc;
          const events = inc.events.map((e) => ({ ...e, done: e.done || now >= e.at }));
          const arrived = events.find((e) => e.kind === 'RESPONDER_ARRIVED')?.done;
          return {
            ...inc,
            responderEtaText: arrived ? 'On Scene' : inc.responderEtaText,
            events,
          };
        });
      });
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  const activeIncident = useMemo(() => {
    if (!activeId) return null;
    return incidents.find((i) => i.id === activeId) ?? null;
  }, [activeId, incidents]);

  const startIncident = () => {
    const now = Date.now();
    const incident: Incident = {
      id: id(),
      type: selectedType,
      status: 'ACTIVE',
      startedAt: now,
      responderEtaText: '03:52',
      responderUnitText: 'Unit 47 — Sandton SAPS',
      events: makeTimeline(now),
    };

    setIncidents((prev) => [incident, ...prev]);
    setActiveId(incident.id);
  };

  const cancelActive = () => {
    if (!activeId) return;
    const now = Date.now();
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === activeId
          ? {
              ...i,
              status: 'CANCELLED',
              resolvedAt: now,
              events: [...i.events, { id: id(), kind: 'CANCELLED', label: 'Cancelled', at: now, done: true }],
            }
          : i
      )
    );
    setActiveId(null);
  };

  const resolveActive = () => {
    if (!activeId) return;
    const now = Date.now();
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === activeId
          ? {
              ...i,
              status: 'RESOLVED',
              resolvedAt: now,
              events: [...i.events, { id: id(), kind: 'RESOLVED', label: 'Resolved', at: now, done: true }],
            }
          : i
      )
    );
    setActiveId(null);
  };

  const value: IscreamContextValue = {
    profile,
    selectedType,
    setSelectedType,
    activeIncident,
    incidents,
    startIncident,
    cancelActive,
    resolveActive,
  };

  return <IscreamContext.Provider value={value}>{children}</IscreamContext.Provider>;
}

export function useIscream() {
  const ctx = useContext(IscreamContext);
  if (!ctx) throw new Error('useIscream must be used within IscreamProvider');
  return ctx;
}