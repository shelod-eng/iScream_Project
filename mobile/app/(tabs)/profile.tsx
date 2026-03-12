import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

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
  const { profile, backend } = useIscream();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.sub}>Demo persona: {profile.fullName}</Text>

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
          <Text style={[styles.meta, { color: BRAND.red, marginTop: 8 }]}>
            Last error: {backend.lastError}
          </Text>
        )}
        <Text style={[styles.meta, { marginTop: 10 }]}>
          To enable: set `EXPO_PUBLIC_API_URL` (laptop IP) and rebuild APK.
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
          This is not supported in Expo Go / standard APK MVP yet. It requires native background audio + OS-level
          permissions (especially strict on iOS). We can prototype it in Phase 2 using a custom dev client and native
          modules.
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

  row: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 10 },
  pill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  pillText: { fontWeight: '900' },

  btn: { marginTop: 12, backgroundColor: BRAND.blue, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '900' },
});