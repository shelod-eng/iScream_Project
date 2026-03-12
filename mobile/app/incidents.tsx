import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useIscream } from '@/lib/iscream';

const BRAND = { navy: '#0D2B5E', bg: '#F4F7FB', border: '#D6DFEE' };

function fmt(ts: number) {
  return new Date(ts).toLocaleString();
}

export default function IncidentsScreen() {
  const { incidents } = useIscream();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.title}>Incident History</Text>
      <Text style={styles.sub}>All SOS events from this device session (MVP).</Text>

      <View style={{ marginTop: 14, gap: 10 }}>
        {incidents.map((i) => (
          <View key={i.id} style={styles.card}>
            <Text style={styles.cardTitle}>{i.type} • {i.status}</Text>
            <Text style={styles.meta}>Started: {fmt(i.startedAt)}</Text>
            {!!i.resolvedAt && <Text style={styles.meta}>Ended: {fmt(i.resolvedAt)}</Text>}
            {(i.latitude != null && i.longitude != null) && (
              <Text style={styles.meta}>Coords: {i.latitude.toFixed(5)}, {i.longitude.toFixed(5)}</Text>
            )}
          </View>
        ))}
        {incidents.length === 0 && (
          <View style={styles.card}>
            <Text style={styles.meta}>No incidents yet. Go to Home and hold SOS.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, backgroundColor: BRAND.bg },
  title: { fontSize: 22, fontWeight: '800', color: BRAND.navy },
  sub: { marginTop: 6, color: '#6B7C92' },
  card: { backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: BRAND.border, padding: 16 },
  cardTitle: { fontWeight: '900', color: '#22344B' },
  meta: { marginTop: 6, color: '#6B7C92' },
});