import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { apiEnabled, apiFetch } from '@/lib/api';

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
  latitude?: number;
  longitude?: number;
};

type Profile = {
  fullName: string;
  email: string;
  locationText: string;
};

export type Contact = {
  id: string;
  name: string;
  phone: string;
  relationship?: string;
};

export type ReportKind = 'GBV';
export type Report = {
  id: string;
  kind: ReportKind;
  summary: string;
  details?: string;
  locationText: string;
  createdAt: number;
};

type IscreamContextValue = {
  profile: Profile;

  selectedType: IncidentType;
  setSelectedType: (t: IncidentType) => void;

  activeIncident: Incident | null;
  incidents: Incident[];
  startIncident: (opts?: { latitude?: number; longitude?: number }) => Promise<void>;
  cancelActive: () => void;
  resolveActive: () => void;

  contacts: Contact[];
  addContact: (c: Omit<Contact, 'id'>) => Promise<void>;
  removeContact: (id: string) => void;

  reports: Report[];
  submitGBVReport: (input: { summary: string; details?: string; locationText?: string }) => Promise<void>;

  backend: {
    enabled: boolean;
    userId: string | null;
    lastError: string | null;
  };
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

  // Demo persona requested: Jackie, Orlando West
  const profile = useMemo<Profile>(
    () => ({ fullName: 'Jackie', email: 'jackie@iscream.app', locationText: 'Orlando West, Soweto' }),
    []
  );

  const [contacts, setContacts] = useState<Contact[]>([
    { id: id(), name: 'Aunt Thando', phone: '+27 71 555 0101', relationship: 'Family' },
    { id: id(), name: 'Neighbour Sipho', phone: '+27 71 555 0102', relationship: 'Neighbour' },
  ]);

  const [reports, setReports] = useState<Report[]>([]);

  const [backendUserId, setBackendUserId] = useState<string | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);

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

  const backendEnabled = apiEnabled();

  const ensureBackendUser = async () => {
    if (!backendEnabled) return null;
    if (backendUserId) return backendUserId;

    try {
      const result = await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ email: profile.email, fullName: profile.fullName }),
      });
      const userId = result?.user?.id as string | undefined;
      if (userId) setBackendUserId(userId);
      setBackendError(null);
      return userId ?? null;
    } catch (e: any) {
      setBackendError(String(e?.message ?? e));
      return null;
    }
  };

  const activeIncident = useMemo(() => {
    if (!activeId) return null;
    return incidents.find((i) => i.id === activeId) ?? null;
  }, [activeId, incidents]);

  const startIncident = async (opts?: { latitude?: number; longitude?: number }) => {
    const now = Date.now();
    const incident: Incident = {
      id: id(),
      type: selectedType,
      status: 'ACTIVE',
      startedAt: now,
      responderEtaText: '03:52',
      responderUnitText: 'Unit 47 — Sandton SAPS',
      events: makeTimeline(now),
      latitude: opts?.latitude,
      longitude: opts?.longitude,
    };

    setIncidents((prev) => [incident, ...prev]);
    setActiveId(incident.id);

    // Optional backend sync
    const userId = await ensureBackendUser();
    if (backendEnabled && userId) {
      try {
        await apiFetch('/api/incidents', {
          method: 'POST',
          body: JSON.stringify({
            userId,
            type: selectedType,
            title: 'SOS Triggered (mobile)',
            description: 'Demo SOS from iScream mobile',
            latitude: opts?.latitude,
            longitude: opts?.longitude,
          }),
        });
        setBackendError(null);
      } catch (e: any) {
        setBackendError(String(e?.message ?? e));
      }
    }
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

  const addContact = async (c: Omit<Contact, 'id'>) => {
    const newContact: Contact = { id: id(), ...c };
    setContacts((prev) => [newContact, ...prev]);

    const userId = await ensureBackendUser();
    if (backendEnabled && userId) {
      try {
        await apiFetch('/api/contacts', {
          method: 'POST',
          body: JSON.stringify({ userId, name: c.name, phone: c.phone, relationship: c.relationship }),
        });
        setBackendError(null);
      } catch (e: any) {
        setBackendError(String(e?.message ?? e));
      }
    }
  };

  const removeContact = (contactId: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
  };

  const submitGBVReport = async (input: { summary: string; details?: string; locationText?: string }) => {
    const now = Date.now();
    const locationText = input.locationText?.trim() || profile.locationText;

    const r: Report = {
      id: id(),
      kind: 'GBV',
      summary: input.summary.trim() || 'GBV report',
      details: input.details?.trim() || undefined,
      locationText,
      createdAt: now,
    };

    setReports((prev) => [r, ...prev]);

    // Optional backend sync: store as NOTE event on a new incident
    const userId = await ensureBackendUser();
    if (backendEnabled && userId) {
      try {
        const incidentRes = await apiFetch('/api/incidents', {
          method: 'POST',
          body: JSON.stringify({
            userId,
            type: 'OTHER',
            title: 'GBV Report (mobile)',
            description: r.summary,
          }),
        });
        const incidentId = incidentRes?.incident?.id as string | undefined;
        if (incidentId && r.details) {
          await apiFetch(`/api/incidents/${incidentId}/events`, {
            method: 'POST',
            body: JSON.stringify({ kind: 'NOTE', message: r.details }),
          });
        }
        setBackendError(null);
      } catch (e: any) {
        setBackendError(String(e?.message ?? e));
      }
    }
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
    contacts,
    addContact,
    removeContact,
    reports,
    submitGBVReport,
    backend: {
      enabled: backendEnabled,
      userId: backendUserId,
      lastError: backendError,
    },
  };

  return <IscreamContext.Provider value={value}>{children}</IscreamContext.Provider>;
}

export function useIscream() {
  const ctx = useContext(IscreamContext);
  if (!ctx) throw new Error('useIscream must be used within IscreamProvider');
  return ctx;
}