import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useIscream } from '@/lib/iscream';

const BRAND = {
  navy: '#0D2B5E',
  blue: '#1565C0',
  bg: '#F4F7FB',
  border: '#D6DFEE',
  red: '#D32F2F',
};

export default function ContactsScreen() {
  const { contacts, addContact, removeContact } = useIscream();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  const canAdd = useMemo(() => name.trim().length > 0 && phone.trim().length > 0, [name, phone]);

  const onAdd = () => {
    if (!canAdd) return;
    addContact({ name: name.trim(), phone: phone.trim(), relationship: relationship.trim() || undefined });
    setName('');
    setPhone('');
    setRelationship('');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.title}>Contacts</Text>
      <Text style={styles.sub}>Guardian network (MVP)</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add contact</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Full name" style={styles.input} />
        <TextInput value={phone} onChangeText={setPhone} placeholder="Phone (+27...)" style={styles.input} keyboardType="phone-pad" />
        <TextInput value={relationship} onChangeText={setRelationship} placeholder="Relationship (optional)" style={styles.input} />
        <Pressable onPress={onAdd} style={[styles.btn, !canAdd && { opacity: 0.5 }]} disabled={!canAdd}>
          <Text style={styles.btnText}>Add</Text>
        </Pressable>
      </View>

      <View style={[styles.card, { marginTop: 14 }]}>
        <Text style={styles.cardTitle}>Saved contacts</Text>
        <View style={{ marginTop: 10, gap: 10 }}>
          {contacts.map((c) => (
            <View key={c.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{c.name}</Text>
                <Text style={styles.meta}>{c.phone}{c.relationship ? ` • ${c.relationship}` : ''}</Text>
              </View>
              <Pressable
                onPress={() =>
                  Alert.alert('Remove contact?', c.name, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => removeContact(c.id) },
                  ])
                }
                style={styles.remove}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          ))}
          {contacts.length === 0 && <Text style={styles.meta}>No contacts yet.</Text>}
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
  cardTitle: { fontWeight: '900', color: '#22344B', marginBottom: 10 },

  input: { borderWidth: 1, borderColor: BRAND.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 10 },

  btn: { marginTop: 12, backgroundColor: BRAND.blue, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '900' },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderWidth: 1, borderColor: BRAND.border, borderRadius: 14 },
  name: { fontWeight: '900', color: '#22344B' },
  meta: { marginTop: 2, color: '#6B7C92' },

  remove: { borderWidth: 2, borderColor: BRAND.red, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  removeText: { color: BRAND.red, fontWeight: '900' },
});