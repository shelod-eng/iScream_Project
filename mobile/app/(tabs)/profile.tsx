import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';

import { useAuth } from '@/lib/auth';
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
  const { enabled: authEnabled, user, signOut } = useAuth();
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
        <Text style={styles.cardTitle}>Account</Text>
        <Text style={styles.meta}>Firebase login: {authEnabled ? 'Enabled' : 'Not configured'}</Text>
        <Text style={styles.meta}>Signed in as: {user?.email ?? 'Demo mode'}</Text>
        {!!user && (
          <Pressable onPress={signOut} style={[styles.btn, { backgroundColor: BRAND.red }]}>
            <Text style={styles.btnText}>Sign out</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Database</Text>
        <Text style={styles.meta}>Firestore sync: {backend.enabled ? 'ON' : 'OFF'}</Text>
        <Text style={styles.meta}>UserId: {backend.userId ?? '—'}</Text>
        {backend.lastError && (
          <Text style={[styles.meta, { color: BRAND.red, marginTop: 8 }]}>Last error: {backend.lastError}</Text>
        )}
        <Text style={[styles.meta, { marginTop: 10 }]}>
          When signed in, contacts/incidents/reports/medical are saved to Firestore.
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

  btn: { marginTop: 12, backgroundColor: BRAND.blue, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '900' },
});