import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ReportScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Report</Text>
      <Text style={styles.sub}>MVP placeholder: non-emergency report form.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, backgroundColor: '#F4F7FB' },
  title: { fontSize: 22, fontWeight: '800', color: '#0D2B5E' },
  sub: { marginTop: 10, color: '#6B7C92' },
});