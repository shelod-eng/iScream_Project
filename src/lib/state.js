export function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function ensureDemoState() {
  const profile = loadJson('iscream.profile', null);
  if (!profile) {
    saveJson('iscream.profile', {
      fullName: 'Demo User',
      phone: '0820000000',
    });
  }

  const contacts = loadJson('iscream.contacts', null);
  if (!Array.isArray(contacts) || contacts.length === 0) {
    saveJson('iscream.contacts', [
      { id: 'c1', name: 'Trusted Contact 1', phone: '0821111111' },
      { id: 'c2', name: 'Trusted Contact 2', phone: '0822222222' },
      { id: 'c3', name: 'Trusted Contact 3', phone: '0823333333' },
    ]);
  }

  const incidents = loadJson('iscream.incidents', null);
  if (!Array.isArray(incidents)) {
    saveJson('iscream.incidents', []);
  }

  const activeId = loadJson('iscream.activeIncidentId', null);
  if (activeId === undefined) {
    saveJson('iscream.activeIncidentId', null);
  }
}

export function setActiveIncidentId(id) {
  saveJson('iscream.activeIncidentId', id ?? null);
}

export function getActiveIncidentId() {
  return loadJson('iscream.activeIncidentId', null);
}

export function getIncidents() {
  return loadJson('iscream.incidents', []);
}

export function saveIncidents(incidents) {
  saveJson('iscream.incidents', incidents);
}

export function getActiveIncident() {
  const activeId = getActiveIncidentId();
  if (!activeId) return null;
  const incidents = getIncidents();
  return incidents.find((i) => i.id === activeId) ?? null;
}

export function clearActiveIfMatches(incidentId) {
  const activeId = getActiveIncidentId();
  if (activeId && activeId === incidentId) {
    setActiveIncidentId(null);
  }
}

export function createIncident({ type, locationLabel }) {
  const incidents = getIncidents();
  const incident = {
    id: `inc_${Date.now()}`,
    createdAt: new Date().toISOString(),
    type: type || 'SOS',
    status: 'sent',
    locationLabel: locationLabel || 'Johannesburg, Gauteng',
    recipients: loadJson('iscream.contacts', []).map((c) => ({ name: c.name, phone: c.phone })),
  };
  incidents.unshift(incident);
  saveIncidents(incidents);
  setActiveIncidentId(incident.id);
  return incident;
}

export function updateIncidentStatus(incidentId, status) {
  const incidents = getIncidents();
  const next = incidents.map((i) => (i.id === incidentId ? { ...i, status } : i));
  saveIncidents(next);
  if (status === 'resolved' || status === 'cancelled') {
    clearActiveIfMatches(incidentId);
  }
  return next;
}
