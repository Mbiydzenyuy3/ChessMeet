// components/StatsCard.tsx
import { COLORS } from '@/constants/colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { UserStats } from '../types/types';

type Props = {
  stats: UserStats;
};

export default function StatsCard({ stats }: Props) {
  return (
    <View style={styles.cardItems}>
      <Text style={styles.title}>Game Stats</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Played:</Text>
        <Text style={styles.value}>{stats.gamesPlayed ?? 0}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Wins:</Text>
        <Text style={[styles.value, { color: COLORS.success }]}>{stats.wins ?? 0}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Losses:</Text>
        <Text style={[styles.value, { color: COLORS.error }]}>{stats.losses ?? 0}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Draws:</Text>
        <Text style={[styles.value, { color: COLORS.orange }]}>{stats.draws ?? 0}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Resigned:</Text>
        <Text style={[styles.value, { color: COLORS.mediumGray }]}>{stats.resigned ?? 0}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardItems: {
    backgroundColor: COLORS.transparentBorder,
    // padding: 16,
    borderRadius: 12,
    shadowColor: COLORS.white,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginVertical: 20,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    color: COLORS.white,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    fontSize: 16,
    color: COLORS.white,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
