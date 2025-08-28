// ============================ components/GameHeader.tsx ============================
import React from 'react';
import { View, Text } from 'react-native';
import { Chip } from './UI';

export default function GameHeader({ status, turn }: { status?: string; turn?: 'w' | 'b' }) {
  return (
    <View
      style={{
        padding: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Text style={{ fontWeight: '700', fontSize: 16 }}>Chessmeet</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Chip>{status || 'active'}</Chip>
        <Chip>{turn === 'w' ? 'Trait aux Blancs' : 'Trait aux Noirs'}</Chip>
      </View>
    </View>
  );
}
