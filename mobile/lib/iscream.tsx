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
  addressText?: string;
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
  photoUri?: string;
  createdAt: number;
};

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type MedicalProfile = {
  fullName: string;
  nickname?: string;
  dob?: string;
  idNumber?: string;
  address?: string;
  heightCm?: number;
  weightKg?: number;
  bloodType?: BloodType;
  allergies: string[];
  conditions: string[];
  medications: { name: string; dosage?: string; frequency?: string }[];
  medicalAid?: { scheme?: string; membershipNumber?: string };
  organDonor?: boolean;
  emergencyContact?: { name?: string; relationship?: string; phone?: string };
  specialNeeds?: string;
};

export type EvidenceUploadStatus = 'pending' | 'recording' | 'uploading' | 'complete' | 'failed';
export type EvidenceRecording = {
  id: string;
  alertId: string;
  userId: string;
  startedAt: number;
  durationSeconds: number;
  status: EvidenceUploadStatus;
  secondsRecorded: number;
  chunksUploaded: number;
  totalChunks: number;
};

export type ChatRole = 'user' | 'bot';
export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  at: number;
};

type IscreamContextValue = {
  profile: Profile;

  selectedType: IncidentType;
  setSelectedType: (t: IncidentType) => void;

  activeIncident: Incident | null;
  incidents: Incident[];
  startIncident: (opts?: { latitude?: number; longitude?: number; addressText?: string }) => Promise<void>;
  cancelActive: () => void;
  resolveActive: () => void;

  contacts: Contact[];
  addContact: (c: Omit<Contact, 'id'>) => Promise<void>;
  removeContact: (id: string) => void;

  reports: Report[];
  submitGBVReport: (input: { summary: string; details?: string; locationText?: string; photoUri?: string }) => Promise<void>;

  medical: {
    profile: MedicalProfile;
    isUnlocked: boolean;
    unlock: (pin: string) => boolean;
    lock: () => void;
    update: (patch: Partial<MedicalProfile>) => void;
  };

  evidence: {
    active: EvidenceRecording | null;
    all: EvidenceRecording[];
  };

  assistant: {
    messages: ChatMessage[];
    send: (text: string) => void;
  };

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

function botReply(userText: string) {
  const t = userText.toLowerCase();
  if (t.includes('guardian') || t.includes('contact')) {
    return "To add a Guardian: open Contacts → Add contact. Guardians get your SOS + location link.";
  }
  if (t.includes('sos') || t.includes('help')) {
    return "To trigger SOS: hold the red SOS button for 3 seconds. The app sends GPS, starts evidence timer, and opens the share sheet to notify guardians.";
  }
  if (t.includes('voice') || t.includes('calibration') || t.includes('phrase')) {
    return "Voice calibration (Phase 2): you’ll record 3 samples + custom phrases. For now, MVP uses hold-to-SOS.";
  }
  if (t.includes('gbv')) {
    return "For GBV: use Report → GBV Quick Report. You can attach photo evidence. For emergencies, use SOS and call 10111/10177.";
  }
  if (t.includes('safe') || t.includes('places') || t.includes('police') || t.includes('hospital')) {
    return "Safe Places Finder: open Places to find nearest SAPS, hospitals, and clinics. Tap Call or Navigate.";
  }
  return "I can help with setup, SOS, contacts, safe places, and GBV reporting. What do you want to do next?";
}

export function IscreamProvider({ children }: { children: React.ReactNode }) {
  const [selectedType, setSelectedType] = useState<IncidentType>('POLICE');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const profile = useMemo<Profile>(
    () => ({ fullName: 'Jackie', email: 'jackie@iscream.app', locationText: 'Orlando West, Soweto' }),
    []
  );

  const [contacts, setContacts] = useState<Contact[]>([
    { id: id(), name: 'Aunt Thando', phone: '+27 71 555 0101', relationship: 'Family' },
    { id: id(), name: 'Neighbour Sipho', phone: '+27 71 555 0102', relationship: 'Neighbour' },
  ]);

  const [reports, setReports] = useState<Report[]>([]);

  const [medicalProfile, setMedicalProfile] = useState<MedicalProfile>({
    fullName: 'Jackie',
    nickname: 'Jackie',
    address: 'Orlando West, Soweto',
    bloodType: 'O+',
    allergies: ['Penicillin'],
    conditions: ['Asthma'],
    medications: [{ name: 'Ventolin', dosage: '2 puffs', frequency: 'as needed' }],
    medicalAid: { scheme: 'Discovery', membershipNumber: 'DEMO-123456' },
    organDonor: false,
    emergencyContact: { name: 'Aunt Thando', relationship: 'Family', phone: '+27 71 555 0101' },
  });
  const [medicalUnlocked, setMedicalUnlocked] = useState(false);

  const [evidenceAll, setEvidenceAll] = useState<EvidenceRecording[]>([]);
  const [activeEvidenceId, setActiveEvidenceId] = useState<string | null>(null);

  const [assistantMessages, setAssistantMessages] = useState<ChatMessage[]>([
    {
      id: id(),
      role: 'bot',
      text: "Hi Jackie — I’m iScream Bot. I can help you set up SOS, medical profile, safe places, and GBV reporting.",
      at: Date.now(),
    },
  ]);

  const [backendUserId, setBackendUserId] = useState<string | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      const now = Date.now();

      setIncidents((prev) =>
        prev.map((inc) => {
          if (inc.status !== 'ACTIVE') return inc;
          const events = inc.events.map((e) => ({ ...e, done: e.done || now >= e.at }));
          const arrived = events.find((e) => e.kind === 'RESPONDER_ARRIVED')?.done;
          return {
            ...inc,
            responderEtaText: arrived ? 'On Scene' : inc.responderEtaText,
            events,
          };
        })
      );

      setEvidenceAll((prev) =>
        prev.map((ev) => {
          if (ev.status === 'complete' || ev.status === 'failed') return ev;
          const elapsed = Math.floor((now - ev.startedAt) / 1000);
          const secondsRecorded = Math.min(ev.durationSeconds, Math.max(0, elapsed));

          const totalChunks = ev.totalChunks;
          const chunkLen = Math.max(1, Math.floor(ev.durationSeconds / totalChunks));
          const chunksUploaded = Math.min(totalChunks, Math.floor(secondsRecorded / chunkLen));

          let status: EvidenceUploadStatus = ev.status;
          if (secondsRecorded > 0 && status === 'pending') status = 'recording';
          if (chunksUploaded > 0 && status === 'recording') status = 'uploading';
          if (secondsRecorded >= ev.durationSeconds && chunksUploaded >= totalChunks) status = 'complete';

          return {
            ...ev,
            secondsRecorded,
            chunksUploaded,
            status,
          };
        })
      );
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

  const activeEvidence = useMemo(() => {
    if (!activeEvidenceId) return null;
    return evidenceAll.find((e) => e.id === activeEvidenceId) ?? null;
  }, [activeEvidenceId, evidenceAll]);

  const startIncident = async (opts?: { latitude?: number; longitude?: number; addressText?: string }) => {
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
      addressText: opts?.addressText,
    };

    setIncidents((prev) => [incident, ...prev]);
    setActiveId(incident.id);

    // F-03 Evidence recording (demo): auto-start timer
    const ev: EvidenceRecording = {
      id: id(),
      alertId: incident.id,
      userId: profile.email,
      startedAt: now,
      durationSeconds: 4 * 60,
      status: 'pending',
      secondsRecorded: 0,
      chunksUploaded: 0,
      totalChunks: 8,
    };
    setEvidenceAll((prev) => [ev, ...prev]);
    setActiveEvidenceId(ev.id);

    const userId = await ensureBackendUser();
    if (backendEnabled && userId) {
      try {
        await apiFetch('/api/incidents', {
          method: 'POST',
          body: JSON.stringify({
            userId,
            type: selectedType,
            title: 'SOS Triggered (mobile)',
            description: incident.addressText ? `Address: ${incident.addressText}` : 'Demo SOS from iScream mobile',
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
    setActiveEvidenceId(null);
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
    setActiveEvidenceId(null);
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

  const submitGBVReport = async (input: { summary: string; details?: string; locationText?: string; photoUri?: string }) => {
    const now = Date.now();
    const locationText = input.locationText?.trim() || profile.locationText;

    const r: Report = {
      id: id(),
      kind: 'GBV',
      summary: input.summary.trim() || 'GBV report',
      details: input.details?.trim() || undefined,
      locationText,
      photoUri: input.photoUri,
      createdAt: now,
    };

    setReports((prev) => [r, ...prev]);

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

  const unlockMedical = (pin: string) => {
    // Demo-only PIN
    if (pin.trim() !== '1234') return false;
    setMedicalUnlocked(true);
    return true;
  };

  const lockMedical = () => setMedicalUnlocked(false);

  const updateMedical = (patch: Partial<MedicalProfile>) => {
    setMedicalProfile((prev) => ({ ...prev, ...patch }));
  };

  const assistantSend = (text: string) => {
    const now = Date.now();
    const userMsg: ChatMessage = { id: id(), role: 'user', text, at: now };
    setAssistantMessages((prev) => [userMsg, ...prev]);

    const reply = botReply(text);
    const botMsg: ChatMessage = { id: id(), role: 'bot', text: reply, at: now + 250 };
    setAssistantMessages((prev) => [botMsg, userMsg, ...prev]);
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
    medical: {
      profile: medicalProfile,
      isUnlocked: medicalUnlocked,
      unlock: unlockMedical,
      lock: lockMedical,
      update: updateMedical,
    },
    evidence: {
      active: activeEvidence,
      all: evidenceAll,
    },
    assistant: {
      messages: assistantMessages,
      send: assistantSend,
    },
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