import React, { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
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

export default function HomeScreen() {
  const router = useRouter();
  const { profile, selectedType, setSelectedType, startIncident, activeIncident } = useIscream();

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
        startIncident();
        router.push('/status');
      }
    }, 50);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>iScream</Text>
      <Text style={styles.subtitle}>Interactive Mobile Prototype</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Logged in as</Text>
        <Text style={styles.cardName}>{profile.fullName}</Text>
        <Text style={styles.cardMeta}>{profile.locationText}</Text>
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
          <Text style={styles.sosHint}>{activeIncident ? 'Emergency Active' : holding ? `Hold… ${(progress * 3).toFixed(1)}s` : 'Hold 3s'}</Text>
        </Pressable>
        {holding && (
          <View style={styles.progressOuter}>
            <View style={[styles.progressInner, { width: `${progress * 100}%` }]} />
          </View>
        )}
      </View>

      {!!activeIncident && (
        <View style={[styles.activeCard, { backgroundColor: BRAND.red }]}>
          <Text style={styles.activeTitle}>EMERGENCY ACTIVE</Text>
          <Text style={styles.activeSub}>{activeIncident.type}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>MVP focus: SOS, status timeline, contacts, backend sync.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BRAND.bg, padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: BRAND.navy },
  subtitle: { marginTop: 4, color: '#4B5C77' },

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
  cardMeta: { marginTop: 2, color: '#5A6B7D' },

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

  activeCard: { marginTop: 18, borderRadius: 14, padding: 14 },
  activeTitle: { color: 'white', fontWeight: '900' },
  activeSub: { color: 'white', marginTop: 4, fontWeight: '700' },

  footer: { marginTop: 'auto', paddingTop: 12 },
  footerText: { color: '#6B7C92', fontSize: 12 },
});