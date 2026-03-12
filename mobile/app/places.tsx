import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';

const BRAND = {
  navy: '#0D2B5E',
  bg: '#F4F7FB',
  border: '#D6DFEE',
};

type Category = 'police' | 'hospital' | 'clinic';

type Place = {
  name: string;
  category: Category;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  hours?: string;
};

const PLACES: Place[] = [
  {
    name: 'Orlando Police Station (SAPS)',
    category: 'police',
    address: 'Orlando, Soweto',
    latitude: -26.2415,
    longitude: 27.9074,
    phone: '10111',
    hours: '24/7',
  },
  {
    name: 'Soweto Police Station (SAPS)',
    category: 'police',
    address: 'Soweto',
    latitude: -26.2679,
    longitude: 27.8587,
    phone: '10111',
    hours: '24/7',
  },
  {
    name: 'Chris Hani Baragwanath Hospital',
    category: 'hospital',
    address: 'Diepkloof, Soweto',
    latitude: -26.2572,
    longitude: 27.9411,
    phone: '10177',
    hours: '24/7',
  },
  {
    name: 'Helen Joseph Hospital',
    category: 'hospital',
    address: 'Auckland Park, Johannesburg',
    latitude: -26.1866,
    longitude: 27.9609,
    phone: '10177',
    hours: '24/7',
  },
  {
    name: 'Orlando Community Clinic',
    category: 'clinic',
    address: 'Orlando West, Soweto',
    latitude: -26.2389,
    longitude: 27.9034,
    hours: '08:00–16:00',
  },
  {
    name: 'Diepkloof Clinic',
    category: 'clinic',
    address: 'Diepkloof, Soweto',
    latitude: -26.2702,
    longitude: 27.9102,
    hours: '08:00–16:00',
  },
];

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLon / 2);
  const q = s1 * s1 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * s2 * s2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(q)));
}

function mapsUrl(lat: number, lng: number) {
  return `https://maps.google.com/?q=${lat},${lng}`;
}

export default function PlacesScreen() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [cat, setCat] = useState<Category>('police');

  useEffect(() => {
    (async () => {
      try {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (perm.status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch {
        // ignore
      }
    })();
  }, []);

  const list = useMemo(() => {
    const base = coords ?? { lat: -26.2389, lng: 27.9034 }; // Orlando West fallback
    return PLACES.filter((p) => p.category === cat)
      .map((p) => ({
        ...p,
        distanceKm: haversineKm(base, { lat: p.latitude, lng: p.longitude }),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 5);
  }, [cat, coords]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.title}>Safe Places</Text>
      <Text style={styles.sub}>Nearest SAPS / Hospitals / Clinics (MVP)</Text>

      <View style={styles.tabs}>
        <Tab label="Police" active={cat === 'police'} onPress={() => setCat('police')} />
        <Tab label="Hospitals" active={cat === 'hospital'} onPress={() => setCat('hospital')} />
        <Tab label="Clinics" active={cat === 'clinic'} onPress={() => setCat('clinic')} />
      </View>

      {list.map((p) => (
        <View key={p.name} style={styles.card}>
          <Text style={styles.cardTitle}>{p.name}</Text>
          <Text style={styles.meta}>{p.address}</Text>
          <Text style={styles.meta}>{p.distanceKm.toFixed(1)} km away{p.hours ? ` • ${p.hours}` : ''}</Text>

          <View style={styles.row}>
            <Pressable onPress={() => Linking.openURL(mapsUrl(p.latitude, p.longitude))} style={styles.btn}>
              <Text style={styles.btnText}>Navigate</Text>
            </Pressable>
            {!!p.phone && (
              <Pressable onPress={() => Linking.openURL(`tel:${p.phone}`)} style={styles.btn}>
                <Text style={styles.btnText}>Call</Text>
              </Pressable>
            )}
          </View>
        </View>
      ))}

      <View style={styles.note}>
        <Text style={styles.noteText}>
          Funding upgrade: replace demo list with Google Places API + offline cache + iScream partner Safe Zones.
        </Text>
      </View>
    </ScrollView>
  );
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, backgroundColor: BRAND.bg },
  title: { fontSize: 22, fontWeight: '800', color: BRAND.navy },
  sub: { marginTop: 6, color: '#6B7C92' },

  tabs: { flexDirection: 'row', gap: 10, marginTop: 14 },
  tab: { flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: BRAND.border, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  tabActive: { borderColor: BRAND.navy, borderWidth: 2 },
  tabText: { fontWeight: '900', color: '#22344B', fontSize: 12 },
  tabTextActive: { color: BRAND.navy },

  card: { marginTop: 14, backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: BRAND.border, padding: 16 },
  cardTitle: { fontWeight: '900', color: '#22344B' },
  meta: { marginTop: 6, color: '#6B7C92' },
  row: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btn: { flex: 1, backgroundColor: BRAND.navy, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '900' },

  note: { marginTop: 16, backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: '#BBDEFB', borderRadius: 16, padding: 14 },
  noteText: { color: '#1A237E', fontWeight: '700' },
});