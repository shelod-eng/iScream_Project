import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/lib/auth';

const BRAND = {
  navy: '#0D2B5E',
  blue: '#1565C0',
  bg: '#F4F7FB',
  border: '#D6DFEE',
};

export default function LoginScreen() {
  const router = useRouter();
  const { enabled, signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const can = useMemo(() => email.includes('@') && password.length >= 6, [email, password]);

  const onLogin = async () => {
    if (!enabled) {
      Alert.alert('Firebase not configured', 'Set EXPO_PUBLIC_FIREBASE_* values and rebuild the APK.');
      return;
    }
    if (!can) return;

    try {
      setBusy(true);
      await signIn(email, password);
      router.replace('/(tabs)' as any);
    } catch (e: any) {
      Alert.alert('Login failed', String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>iScream</Text>
      <Text style={styles.sub}>Sign in (Email + Password)</Text>

      <View style={styles.card}>
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={styles.input} autoCapitalize="none" />
        <TextInput value={password} onChangeText={setPassword} placeholder="Password" style={styles.input} secureTextEntry />

        <Pressable onPress={onLogin} disabled={!can || busy} style={[styles.btn, (!can || busy) && { opacity: 0.5 }]}>
          <Text style={styles.btnText}>{busy ? 'Signing in…' : 'Sign in'}</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/register' as any)} style={styles.link}>
          <Text style={styles.linkText}>Create an account</Text>
        </Pressable>
      </View>

      <Text style={styles.note}>
        If Firebase is not configured, you can still use the demo, but login + database won’t work.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, backgroundColor: BRAND.bg, justifyContent: 'center' },
  title: { fontSize: 34, fontWeight: '900', color: BRAND.navy, textAlign: 'center' },
  sub: { marginTop: 6, color: '#6B7C92', textAlign: 'center' },
  card: { marginTop: 18, backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: BRAND.border, padding: 16 },
  input: { borderWidth: 1, borderColor: BRAND.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 10 },
  btn: { marginTop: 14, backgroundColor: BRAND.blue, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '900' },
  link: { marginTop: 12, alignItems: 'center' },
  linkText: { color: BRAND.navy, fontWeight: '900' },
  note: { marginTop: 16, textAlign: 'center', color: '#6B7C92', fontSize: 12 },
});