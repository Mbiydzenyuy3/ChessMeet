import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { MoveObj } from '../store/gameSlice';

export default function MoveList({ moves }: { moves: MoveObj[] }) {
  return (
    <ScrollView
      style={{
        padding: 12,
        backgroundColor: 'white',
        borderLeftWidth: 1,
        borderColor: '#e5e7eb',
        width: 200,
      }}
    >
      <Text style={{ fontWeight: '700', marginBottom: 8 }}>Historique</Text>
      {moves.map((m, i) => (
        <View
          key={i}
          style={{ paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}
        >
          <Text>
            #{i + 1} {m.san || `${m.from}-${m.to}`}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
