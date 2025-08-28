import Board from '@/components/Board';
import { COLORS } from '@/constants/colors';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function PlayLocal() {
  return (
    <View style={styles.contain}>
      <Board />
    </View>
  );
}

const styles = StyleSheet.create({
  contain: {
    flex: 1,
    backgroundColor: COLORS.BackgroundColor,
  },
});
