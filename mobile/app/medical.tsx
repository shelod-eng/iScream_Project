import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useIscream } from '@/lib/iscream';

const BRAND = {
  navy: '#0D2B5E',
  blue: '#1565C0',
  bg: '#F4F7FB',
  border: '#D6DFEE',
  green: '#1B8A3A',
  red: '#D32F2F',
};

function mask(value: string | undefined) {
  if (!value) return '—';
  if (value.length <= 4) return '••••';
  return `${value.slice(0, 2)}••••••${value.slice(-2)}`;
}

export default function MedicalProfileScreen() {
  const { medical, activeIncident, profile } = useIscream();
  const [pin, setPin] = useState('');

  const shared = useMemo(() => {
    return {
      name: medical.profile.fullName || profile.fullName,
      bloodType: medical.profile.bloodType ?? '—',
    };
  }, [medical.profile.bloodType, medical.profile.fullName, profile.fullName]);

  const onUnlock = () => {
    const ok = medical.unlock(pin);
    if (!ok) {
      Alert.alert('Invalid PIN', 'Demo PIN is 1234');
      return;
    }
    setPin('');
  };

  const locked = !medical.isUnlocked;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.title}>Medical Profile</Text>
      <Text style={styles.sub}>Encrypted profile (MVP demo — local only)</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Shared during SOS (Guardian view)</Text>
        <Text style={styles.meta}>Name: {shared.name}</Text>
        <Text style={styles.meta}>Blood type: {shared.bloodType}</Text>
        <Text style={[styles.meta, { marginTop: 10 }]}>
          Status: {activeIncident ? 'SOS ACTIVE — guardians can view the shared fields.' : 'No SOS active'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Access control</Text>
        <Text style={styles.meta}>Sensitive fields are hidden until you unlock.</Text>

        {locked ? (
          <>
            <TextInput
              value={pin}
              onChangeText={setPin}
              placeholder="Enter PIN (demo: 1234)"
              style={styles.input}
              secureTextEntry
              keyboardType="number-pad"
            />
            <Pressable onPress={onUnlock} style={styles.btn}>
              <Text style={styles.btnText}>Unlock</Text>
            </Pressable>
          </>
        ) : (
          <Pressable onPress={medical.lock} style={[styles.btn, { backgroundColor: BRAND.red }]}>
            <Text style={styles.btnText}>Lock</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Identity</Text>
        <Field label="Full name" value={medical.profile.fullName} locked={false} />
        <Field label="Nickname" value={medical.profile.nickname} locked={locked} />
        <Field label="Date of birth" value={medical.profile.dob} locked={locked} />
        <Field label="SA ID number" value={locked ? mask(medical.profile.idNumber) : medical.profile.idNumber} locked={false} />
        <Field label="Address" value={locked ? '•••••• (locked)' : medical.profile.address} locked={false} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Medical</Text>
        <Field label="Blood type" value={medical.profile.bloodType} locked={false} />
        <Field label="Allergies" value={(medical.profile.allergies || []).join(', ')} locked={locked} />
        <Field label="Conditions" value={(medical.profile.conditions || []).join(', ')} locked={locked} />
        <Field
          label="Medications"
          value={(medical.profile.medications || []).map((m) => `${m.name}${m.dosage ? ` (${m.dosage})` : ''}`).join(', ')}
          locked={locked}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Emergency contact</Text>
        <Field label="Name" value={medical.profile.emergencyContact?.name} locked={locked} />
        <Field label="Relationship" value={medical.profile.emergencyContact?.relationship} locked={locked} />
        <Field label="Phone" value={medical.profile.emergencyContact?.phone} locked={locked} />
      </View>
    </ScrollView>
  );
}

function Field({ label, value, locked }: { label: string; value?: string; locked: boolean }) {
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{locked ? '•••••• (locked)' : value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, backgroundColor: BRAND.bg },
  title: { fontSize: 22, fontWeight: '800', color: BRAND.navy },
  sub: { marginTop: 6, color: '#6B7C92' },

  card: { marginTop: 14, backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: BRAND.border, padding: 16 },
  cardTitle: { fontWeight: '900', color: '#22344B' },
  meta: { marginTop: 8, color: '#6B7C92' },

  input: { borderWidth: 1, borderColor: BRAND.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 12 },
  btn: { marginTop: 12, backgroundColor: BRAND.blue, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '900' },

  label: { color: BRAND.green, fontWeight: '800', fontSize: 12 },
  value: { marginTop: 4, color: '#22344B', fontWeight: '700' },
});