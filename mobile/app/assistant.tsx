import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useIscream } from '@/lib/iscream';

const BRAND = {
  navy: '#0D2B5E',
  blue: '#1565C0',
  bg: '#F4F7FB',
  border: '#D6DFEE',
};

export default function AssistantScreen() {
  const { assistant } = useIscream();
  const [text, setText] = useState('');

  const messages = useMemo(() => [...assistant.messages].sort((a, b) => a.at - b.at), [assistant.messages]);

  const onSend = () => {
    const t = text.trim();
    if (!t) return;
    assistant.send(t);
    setText('');
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>iScream Bot</Text>
      <Text style={styles.sub}>On-device FAQ assistant (MVP demo)</Text>

      <ScrollView style={styles.chat} contentContainerStyle={{ paddingBottom: 14 }}>
        {messages.map((m) => (
          <View key={m.id} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.botBubble]}>
            <Text style={[styles.bubbleText, m.role === 'user' ? { color: 'white' } : { color: '#22344B' }]}> 
              {m.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.composer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Ask about SOS, guardians, GBV, safe places…"
          style={styles.input}
        />
        <Pressable onPress={onSend} style={styles.send}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>

      <View style={styles.quickRow}>
        <Pressable onPress={() => assistant.send('How do I add a guardian?')} style={styles.quickBtn}>
          <Text style={styles.quickText}>Add guardian</Text>
        </Pressable>
        <Pressable onPress={() => assistant.send('What happens when SOS triggers?')} style={styles.quickBtn}>
          <Text style={styles.quickText}>SOS flow</Text>
        </Pressable>
        <Pressable onPress={() => assistant.send('Show safe places near me')} style={styles.quickBtn}>
          <Text style={styles.quickText}>Safe places</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BRAND.bg, padding: 20 },
  title: { fontSize: 22, fontWeight: '800', color: BRAND.navy },
  sub: { marginTop: 6, color: '#6B7C92' },

  chat: { marginTop: 14, flex: 1 },
  bubble: { maxWidth: '85%', padding: 12, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: BRAND.border },
  userBubble: { alignSelf: 'flex-end', backgroundColor: BRAND.blue, borderColor: BRAND.blue },
  botBubble: { alignSelf: 'flex-start', backgroundColor: 'white' },
  bubbleText: { fontWeight: '700' },

  composer: { flexDirection: 'row', gap: 10, marginTop: 10 },
  input: { flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: BRAND.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  send: { backgroundColor: BRAND.navy, paddingHorizontal: 14, borderRadius: 12, justifyContent: 'center' },
  sendText: { color: 'white', fontWeight: '900' },

  quickRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  quickBtn: { flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: BRAND.border, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  quickText: { fontWeight: '900', color: BRAND.navy, fontSize: 12 },
});