import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

import { useIscream, type IncidentType } from '@/lib/iscream';

const BRAND = {
  navy: '#0D2B5E',
  blue: '#1565C0',
  bg: '#F4F7FB',
  red: '#D32F2F',
  green: '#1B8A3A',
};

const TYPES: { key: IncidentType; label: string }[] = [
  { key: 'POLICE', label: 'Police' },
  { key: 'MEDICAL', label: 'Medical' },
  { key: 'FIRE', label: 'Fire' },
  { key: 'CRIME', label: 'Crime' },
];

function mapsLink(latitude?: number, longitude?: number) {
  if (latitude == null || longitude == null) return null;
  return `https://maps.google.com/?q=${latitude},${longitude}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { profile, selectedType, setSelectedType, startIncident, activeIncident, backend, contacts } = useIscream();

  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [addressText, setAddressText] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (perm.status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const c = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setCoords(c);

        try {
          const geo = await Location.reverseGeocodeAsync(c);
          const a = geo?.[0];
          if (a) {
            const parts = [a.name, a.street, a.district, a.city, a.region].filter(Boolean);
            const txt = parts.join(', ');
            if (txt) setAddressText(txt);
          }
        } catch {
          // ignore
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const [holding, setHolding] = useState(false);
  const [holdMs, setHoldMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startAtRef = useRef<number | null>(null);

  const progress = useMemo(() => Math.min(1, holdMs / 3000), [holdMs]);

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    startAtRef.current = null;
    setHolding(false);
    setHoldMs(0);
  };

  const buildSOSMessage = () => {
    const link = mapsLink(coords?.latitude, coords?.longitude);
    const guardians = contacts.map((c) => c.name).slice(0, 5).join(', ');
    const lines = [
      `iScream SOS: ${profile.fullName} needs help (${selectedType}).`,
      `Address: ${addressText ?? profile.locationText}.`,
      link ? `Map: ${link}` : null,
      guardians ? `Guardians: ${guardians}` : null,
      `Time: ${new Date().toLocaleString()}`,
    ].filter(Boolean);
    return lines.join('\n');
  };

  const notifyGuardians = async () => {
    await Share.share({ message: buildSOSMessage() });
  };

  const onPressIn = () => {
    if (activeIncident) return;
    setHolding(true);
    startAtRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const startedAt = startAtRef.current ?? Date.now();
      const ms = Date.now() - startedAt;
      setHoldMs(ms);

      if (ms >= 3000) {
        stop();
        (async () => {
          try {
            await startIncident({
              latitude: coords?.latitude,
              longitude: coords?.longitude,
              addressText: addressText ?? undefined,
            });
            await Notifications.scheduleNotificationAsync({
              content: { title: 'iScream SOS Triggered', body: 'Emergency started. View status timeline.' },
              trigger: null,
            });
            await notifyGuardians();
          } catch {
            // ignore
          }
          router.push('/(tabs)/status');
        })();
      }
    }, 50);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>iScream</Text>
      <Text style={styles.subtitle}>Mobile MVP (Expo)</Text>

      <View style={styles.pills}>
        <View style={[styles.pill, { backgroundColor: backend.enabled ? '#E8F5E9' : '#FFF3E0' }]}>
          <Text style={[styles.pillText, { color: backend.enabled ? '#1B8A3A' : '#E67E22' }]}>
            {backend.enabled ? 'Backend Sync ON' : 'Backend Sync OFF'}
          </Text>
        </View>
        <View style={[styles.pill, { backgroundColor: coords ? '#E3F2FD' : '#ECEFF1' }]}>
          <Text style={[styles.pillText, { color: coords ? BRAND.blue : '#607D8B' }]}>
            {coords ? 'GPS Ready' : 'No GPS'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Logged in as</Text>
        <Text style={styles.cardName}>{profile.fullName}</Text>
        <Text style={styles.cardMeta}>{profile.locationText}</Text>
        {addressText && <Text style={styles.cardMeta}>Address: {addressText}</Text>}
        {coords && <Text style={styles.cardMeta}>Coords: {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}</Text>}
      </View>

      <Text style={styles.section}>Select emergency type</Text>
      <View style={styles.typeRow}>
        {TYPES.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setSelectedType(t.key)}
            style={[styles.typeBtn, selectedType === t.key && styles.typeBtnActive]}>
            <Text style={[styles.typeText, selectedType === t.key && styles.typeTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.sosWrap}>
        <Pressable
          onPressIn={onPressIn}
          onPressOut={stop}
          style={[styles.sos, activeIncident && styles.sosDisabled]}
          disabled={!!activeIncident}>
          <Text style={styles.sosText}>SOS</Text>
          <Text style={styles.sosHint}>
            {activeIncident ? 'Emergency Active' : holding ? `Hold… ${(progress * 3).toFixed(1)}s` : 'Hold 3s'}
          </Text>
        </Pressable>
        {holding && (
          <View style={styles.progressOuter}>
            <View style={[styles.progressInner, { width: `${progress * 100}%` }]} />
          </View>
        )}
      </View>

      <View style={styles.rowButtons}>
        <Pressable onPress={() => router.push('/incidents' as any)} style={styles.secondaryBtn}>
          <Text style={styles.secondaryText}>Incident History</Text>
        </Pressable>
        <Pressable onPress={notifyGuardians} style={styles.secondaryBtn}>
          <Text style={styles.secondaryText}>Notify Guardians</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Now includes: GPS, address, share alerts, calls, reports, evidence.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BRAND.bg, padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: BRAND.navy },
  subtitle: { marginTop: 4, color: '#4B5C77' },

  pills: { flexDirection: 'row', gap: 10, marginTop: 12 },
  pill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  pillText: { fontWeight: '800', fontSize: 12 },

  card: {
    marginTop: 16,
    backgroundColor: '#E9F6EC',
    borderColor: '#BFE5C7',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  cardLabel: { color: BRAND.green, fontWeight: '700', fontSize: 12 },
  cardName: { marginTop: 4, fontSize: 18, fontWeight: '800', color: '#0B1B2B' },
  cardMeta: { marginTop: 6, color: '#5A6B7D' },

  section: { marginTop: 18, fontWeight: '700', color: '#22344B' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  typeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'white',
    borderColor: '#D6DFEE',
    borderWidth: 1,
  },
  typeBtnActive: { borderColor: BRAND.blue, borderWidth: 2 },
  typeText: { color: '#22344B', fontWeight: '700' },
  typeTextActive: { color: BRAND.blue },

  sosWrap: { alignItems: 'center', marginTop: 22 },
  sos: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: BRAND.red,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 4,
  },
  sosDisabled: { opacity: 0.6 },
  sosText: { color: 'white', fontSize: 44, fontWeight: '900' },
  sosHint: { color: 'white', marginTop: 6, fontWeight: '700' },

  progressOuter: {
    marginTop: 12,
    width: 220,
    height: 8,
    backgroundColor: '#E1E8F5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressInner: { height: 8, backgroundColor: BRAND.blue },

  rowButtons: { flexDirection: 'row', gap: 10, marginTop: 14 },
  secondaryBtn: { flex: 1, backgroundColor: BRAND.navy, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  secondaryText: { color: 'white', fontWeight: '900' },

  footer: { marginTop: 'auto', paddingTop: 12 },
  footerText: { color: '#6B7C92', fontSize: 12 },
});