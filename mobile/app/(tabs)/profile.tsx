import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.sub}>MVP placeholder: profile + voice enrollment (future R&D).</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, backgroundColor: '#F4F7FB' },
  title: { fontSize: 22, fontWeight: '800', color: '#0D2B5E' },
  sub: { marginTop: 10, color: '#6B7C92' },
});