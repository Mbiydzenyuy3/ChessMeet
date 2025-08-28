// ============================ components/AssistantPanel.tsx ============================
import React from 'react';
import { View, Text, Switch, Pressable, ScrollView } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { setSuggestions, toggleAssistant } from '../store/gameSlice';

export default function AssistantPanel({ onAsk }: { onAsk: () => void }) {
  const dispatch = useAppDispatch();
  const { suggestions, assistantEnabled } = useAppSelector((s) => s.game);
  return (
    <View
      style={{
        width: 280,
        backgroundColor: 'white',
        borderLeftWidth: 1,
        borderColor: '#e5e7eb',
        padding: 12,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '700' }}>Coach IA</Text>
        <Switch value={assistantEnabled} onValueChange={() => dispatch(toggleAssistant())} />
      </View>
      <Pressable
        onPress={onAsk}
        style={{ padding: 10, backgroundColor: '#111827', borderRadius: 10 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Demander une suggestion</Text>
      </Pressable>
      <ScrollView style={{ marginTop: 10 }}>
        {suggestions.length === 0 ? (
          <Text style={{ color: '#6b7280' }}>Aucune suggestion pour l'instant.</Text>
        ) : (
          suggestions.map((s, i) => (
            <View
              key={i}
              style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}
            >
              <Text style={{ fontWeight: '600' }}>{s.move}</Text>
              {s.reason ? <Text style={{ color: '#374151' }}>{s.reason}</Text> : null}
            </View>
          ))
        )}
      </ScrollView>
      <Pressable onPress={() => dispatch(setSuggestions([]))} style={{ padding: 8 }}>
        <Text style={{ color: '#6b7280', textAlign: 'center' }}>Effacer</Text>
      </Pressable>
    </View>
  );
}
