import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useIscream } from '@/lib/iscream';

const BRAND = {
  navy: '#0D2B5E',
  bg: '#F4F7FB',
  red: '#D32F2F',
  green: '#1B8A3A',
  border: '#D6DFEE',
};

function fmtDuration(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function mapsLink(latitude?: number, longitude?: number) {
  if (latitude == null || longitude == null) return null;
  return `https://maps.google.com/?q=${latitude},${longitude}`;
}

export default function StatusScreen() {
  const router = useRouter();
  const { activeIncident, cancelActive, resolveActive, backend, profile, contacts } = useIscream();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const duration = useMemo(() => {
    if (!activeIncident) return '00:00';
    return fmtDuration(now - activeIncident.startedAt);
  }, [activeIncident, now]);

  const shareAlert = async () => {
    if (!activeIncident) return;
    const link = mapsLink(activeIncident.latitude, activeIncident.longitude);
    const guardians = contacts.map((c) => c.name).slice(0, 5).join(', ');
    const lines = [
      `iScream SOS: ${profile.fullName} needs help (${activeIncident.type}).`,
      `Address: ${activeIncident.addressText ?? profile.locationText}.`,
      link ? `Map: ${link}` : null,
      guardians ? `Guardians: ${guardians}` : null,
      `Time: ${new Date(activeIncident.startedAt).toLocaleString()}`,
    ].filter(Boolean);

    await Share.share({ message: lines.join('\n') });
  };

  if (!activeIncident) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Status</Text>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No active emergency</Text>
          <Text style={styles.emptySub}>Go to Home and hold SOS to start a demo incident.</Text>
        </View>
        <Pressable onPress={() => router.push('/incidents' as any)} style={styles.link}>
          <Text style={styles.linkText}>View Incident History</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.header}>
        <Text style={styles.headerTop}>EMERGENCY ACTIVE</Text>
        <Text style={styles.headerType}>{activeIncident.type}</Text>
        <View style={styles.headerRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Duration</Text>
            <Text style={styles.metricValue}>{duration}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Responder ETA</Text>
            <Text style={styles.metricValue}>{activeIncident.responderEtaText}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>LOCATION</Text>
        <Text style={styles.meta}>{activeIncident.addressText ?? profile.locationText}</Text>
        {(activeIncident.latitude != null && activeIncident.longitude != null) && (
          <Text style={styles.meta}>Coords: {activeIncident.latitude.toFixed(5)}, {activeIncident.longitude.toFixed(5)}</Text>
        )}

        <View style={styles.actionRow}>
          <Pressable onPress={() => Linking.openURL('tel:10111')} style={styles.actionBtn}>
            <Text style={styles.actionText}>Call 10111</Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL('tel:10177')} style={styles.actionBtn}>
            <Text style={styles.actionText}>Call 10177</Text>
          </Pressable>
        </View>
        <View style={styles.actionRow}>
          <Pressable onPress={shareAlert} style={styles.actionBtn}>
            <Text style={styles.actionText}>Share SOS</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/incidents' as any)} style={styles.actionBtn}>
            <Text style={styles.actionText}>History</Text>
          </Pressable>
        </View>
      </View>

      {backend.lastError && (
        <View style={styles.warn}>
          <Text style={styles.warnTitle}>Backend sync warning</Text>
          <Text style={styles.warnText}>{backend.lastError}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>RESPONSE TIMELINE</Text>
        <View style={{ marginTop: 10, gap: 12 }}>
          {activeIncident.events.map((e) => (
            <View key={e.id} style={styles.eventRow}>
              <View style={[styles.dot, e.done ? styles.dotDone : styles.dotTodo]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.eventLabel, !e.done && { opacity: 0.45 }]}>{e.label}</Text>
                {!!e.detail && <Text style={[styles.eventDetail, !e.done && { opacity: 0.35 }]}>{e.detail}</Text>}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable onPress={resolveActive} style={[styles.btn, styles.btnGreen]}>
            <Text style={styles.btnText}>Mark Resolved</Text>
          </Pressable>
          <Pressable onPress={cancelActive} style={[styles.btn, styles.btnOutline]}>
            <Text style={[styles.btnText, { color: BRAND.red }]}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BRAND.bg, padding: 20 },
  title: { fontSize: 22, fontWeight: '800', color: BRAND.navy },

  emptyCard: {
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    padding: 14,
  },
  emptyTitle: { fontWeight: '900', color: '#22344B' },
  emptySub: { marginTop: 6, color: '#6B7C92' },

  header: { backgroundColor: BRAND.red, borderRadius: 16, padding: 16 },
  headerTop: { color: 'white', fontWeight: '900' },
  headerType: { marginTop: 6, color: 'white', fontSize: 22, fontWeight: '900' },
  headerRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  metric: { flex: 1, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 14, padding: 12 },
  metricLabel: { color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: 12 },
  metricValue: { marginTop: 6, color: 'white', fontWeight: '900', fontSize: 20 },

  warn: { marginTop: 14, backgroundColor: '#FFF3E0', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#FFE0B2' },
  warnTitle: { fontWeight: '900', color: '#E67E22' },
  warnText: { marginTop: 6, color: '#6B7C92' },

  link: { marginTop: 16, backgroundColor: BRAND.navy, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  linkText: { color: 'white', fontWeight: '900' },

  card: { marginTop: 16, backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: BRAND.border, padding: 16 },
  cardTitle: { color: '#6B7C92', fontWeight: '900', letterSpacing: 1 },
  meta: { marginTop: 8, color: '#22344B' },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: { flex: 1, backgroundColor: BRAND.navy, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  actionText: { color: 'white', fontWeight: '900' },

  eventRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  dot: { width: 14, height: 14, borderRadius: 7, marginTop: 3 },
  dotDone: { backgroundColor: BRAND.green },
  dotTodo: { backgroundColor: '#C7D2E3' },
  eventLabel: { fontWeight: '900', color: '#22344B' },
  eventDetail: { marginTop: 2, color: '#6B7C92' },

  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  btnGreen: { backgroundColor: BRAND.green },
  btnOutline: { borderWidth: 2, borderColor: BRAND.red, backgroundColor: 'white' },
  btnText: { color: 'white', fontWeight: '900' },
});