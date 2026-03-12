import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useIscream } from '@/lib/iscream';

const BRAND = {
  navy: '#0D2B5E',
  blue: '#1565C0',
  bg: '#F4F7FB',
  border: '#D6DFEE',
};

function fmt(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString();
}

export default function ReportScreen() {
  const { profile, reports, submitGBVReport } = useIscream();
  const [summary, setSummary] = useState('GBV: I feel unsafe and need help');
  const [details, setDetails] = useState('');
  const [locationText, setLocationText] = useState(profile.locationText);

  const canSubmit = useMemo(() => summary.trim().length > 5, [summary]);

  const onSubmit = () => {
    if (!canSubmit) return;
    submitGBVReport({ summary, details, locationText });
    setDetails('');
    Alert.alert('Report submitted', 'Your GBV report was saved (demo).');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.title}>Report</Text>
      <Text style={styles.sub}>Use case: Gender-Based Violence (GBV)</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>GBV Quick Report</Text>
        <Text style={styles.help}>This is a non-emergency report flow for follow-up, support services, and evidence logging.</Text>

        <TextInput value={summary} onChangeText={setSummary} placeholder="Short summary" style={styles.input} />
        <TextInput value={locationText} onChangeText={setLocationText} placeholder="Location" style={styles.input} />
        <TextInput
          value={details}
          onChangeText={setDetails}
          placeholder="Add details (optional): what happened, when, any risks"
          style={[styles.input, { height: 110, textAlignVertical: 'top' }]}
          multiline
        />

        <Pressable onPress={onSubmit} style={[styles.btn, !canSubmit && { opacity: 0.5 }]} disabled={!canSubmit}>
          <Text style={styles.btnText}>Submit Report</Text>
        </Pressable>
      </View>

      <View style={[styles.card, { marginTop: 14 }]}>
        <Text style={styles.cardTitle}>Recent reports</Text>
        <View style={{ marginTop: 10, gap: 10 }}>
          {reports.map((r) => (
            <View key={r.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{r.summary}</Text>
                <Text style={styles.rowMeta}>{r.locationText} • {fmt(r.createdAt)}</Text>
                {!!r.details && <Text style={styles.rowDetail}>{r.details}</Text>}
              </View>
            </View>
          ))}
          {reports.length === 0 && <Text style={styles.rowMeta}>No reports yet.</Text>}
        </View>
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
  help: { marginTop: 8, color: '#6B7C92' },

  input: { borderWidth: 1, borderColor: BRAND.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 10 },
  btn: { marginTop: 12, backgroundColor: BRAND.blue, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '900' },

  row: { padding: 12, borderWidth: 1, borderColor: BRAND.border, borderRadius: 14 },
  rowTitle: { fontWeight: '900', color: '#22344B' },
  rowMeta: { marginTop: 4, color: '#6B7C92' },
  rowDetail: { marginTop: 6, color: '#22344B' },
});