/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, Switch, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { setSuggestions, setAssistantEnabled } from '../store/gameSlice';

export default function AssistantPanel({
  onAsk,
  fullWidth = false,
}: {
  onAsk: () => void;
  fullWidth?: boolean;
}) {
  const dispatch = useAppDispatch();
  const { suggestions, assistantEnabled, loading } = useAppSelector((s) => s.game);

  return (
    <View
      style={{
        width: fullWidth ? '100%' : 280,
        backgroundColor: 'white',
        borderLeftWidth: fullWidth ? 0 : 1,
        borderColor: '#e5e7eb',
        padding: 12,
        flex: fullWidth ? 1 : undefined,
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
        <Switch
          value={assistantEnabled}
          onValueChange={(value) => {
            dispatch(setAssistantEnabled(value));
          }}
        />
      </View>

      <Pressable
        onPress={onAsk}
        style={{ padding: 10, backgroundColor: '#111827', borderRadius: 10 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Ask for a suggestion</Text>
      </Pressable>

      <ScrollView style={{ marginTop: 10 }}>
        {loading ? (
          <Loading label="Chargement des suggestions..." />
        ) : suggestions.length === 0 ? (
          <Text style={{ color: '#6b7280' }}>No suggestions yet.</Text>
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

export const Loading = ({ label }: { label?: string }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', padding: 16 }}>
    <ActivityIndicator size="large" color="#111827" />
    {label ? <Text style={{ marginTop: 8, color: '#374151' }}>{label}</Text> : null}
  </View>
);
