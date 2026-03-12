import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';

import { useIscream } from '@/lib/iscream';

const BRAND = {
  navy: '#0D2B5E',
  blue: '#1565C0',
  bg: '#F4F7FB',
  border: '#D6DFEE',
  red: '#D32F2F',
  green: '#1B8A3A',
};

const DASHBOARD_URL = process.env.EXPO_PUBLIC_DASHBOARD_URL?.trim();

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, backend } = useIscream();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.title}>More</Text>
      <Text style={styles.sub}>Phase 1 features for funding demo</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Access</Text>
        <View style={styles.grid}>
          <Pressable onPress={() => router.push('/medical' as any)} style={styles.tile}>
            <Text style={styles.tileTitle}>Medical Profile</Text>
            <Text style={styles.tileSub}>Unlock demo PIN: 1234</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/assistant' as any)} style={styles.tile}>
            <Text style={styles.tileTitle}>iScream Bot</Text>
            <Text style={styles.tileSub}>Setup + safety tips</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/places' as any)} style={styles.tile}>
            <Text style={styles.tileTitle}>Safe Places</Text>
            <Text style={styles.tileSub}>SAPS / hospitals / clinics</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/incidents' as any)} style={styles.tile}>
            <Text style={styles.tileTitle}>Incident History</Text>
            <Text style={styles.tileSub}>All SOS events</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>User</Text>
        <Text style={styles.meta}>Name: {profile.fullName}</Text>
        <Text style={styles.meta}>Email: {profile.email}</Text>
        <Text style={styles.meta}>Location: {profile.locationText}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Backend Sync</Text>
        <View style={styles.row}>
          <View style={[styles.pill, { backgroundColor: backend.enabled ? '#E8F5E9' : '#FFF3E0' }]}>
            <Text style={[styles.pillText, { color: backend.enabled ? BRAND.green : '#E67E22' }]}>
              {backend.enabled ? 'ON' : 'OFF'}
            </Text>
          </View>
          <Text style={styles.meta}>UserId: {backend.userId ?? 'not created yet'}</Text>
        </View>
        {backend.lastError && (
          <Text style={[styles.meta, { color: BRAND.red, marginTop: 8 }]}>Last error: {backend.lastError}</Text>
        )}
        <Text style={[styles.meta, { marginTop: 10 }]}>
          To enable: set `EXPO_PUBLIC_API_URL` to your laptop IP (same Wi‑Fi) and rebuild APK.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Admin Dashboard</Text>
        <Text style={styles.meta}>Web admin is for operators (incidents overview).</Text>
        <Pressable
          onPress={() => {
            if (!DASHBOARD_URL) return;
            WebBrowser.openBrowserAsync(DASHBOARD_URL);
          }}
          disabled={!DASHBOARD_URL}
          style={[styles.btn, !DASHBOARD_URL && { opacity: 0.5 }]}
        >
          <Text style={styles.btnText}>{DASHBOARD_URL ? 'Open Dashboard' : 'Set DASHBOARD_URL first'}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Voice Activation (Locked Phone)</Text>
        <Text style={styles.meta}>
          Phase 2 R&D: background audio monitoring + on-device model + OS permissions. Not shipped in this APK MVP.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, backgroundColor: BRAND.bg },
  title: { fontSize: 22, fontWeight: '800', color: BRAND.navy },
  sub: { marginTop: 6, color: '#6B7C92' },

  card: { marginTop: 14, backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: BRAND.border, padding: 16 },
  cardTitle: { fontWeight: '900', color: '#22344B' },
  meta: { marginTop: 8, color: '#6B7C92' },

  grid: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '48%', backgroundColor: '#F4F7FB', borderWidth: 1, borderColor: BRAND.border, borderRadius: 14, padding: 12 },
  tileTitle: { fontWeight: '900', color: BRAND.navy },
  tileSub: { marginTop: 6, color: '#6B7C92', fontSize: 12 },

  row: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 10 },
  pill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  pillText: { fontWeight: '900' },

  btn: { marginTop: 12, backgroundColor: BRAND.blue, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '900' },
});