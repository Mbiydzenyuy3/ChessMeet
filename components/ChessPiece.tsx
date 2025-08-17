import { COLORS } from '@/constants/colors';
import { PieceColor, PieceType } from '@/types/chess';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ChessPieceProps {
  type: PieceType;
  color: PieceColor;
  size: number;
}

const pieceUnicode: Record<PieceType, { white: string; black: string }> = {
  king: { white: '♔', black: '♚' },
  queen: { white: '♕', black: '♛' },
  rook: { white: '♖', black: '♜' },
  bishop: { white: '♗', black: '♝' },
  knight: { white: '♘', black: '♞' },
  pawn: { white: '♙', black: '♟' },
};

export default function ChessPiece({ type, color, size }: ChessPieceProps) {
  const piece = pieceUnicode[type][color];

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.piece,
          {
            fontSize: size,
            color: color === COLORS.white ? COLORS.whitetext : COLORS.blacktext,
            textShadowColor: color === COLORS.white ? COLORS.whitetext : COLORS.blacktext,
          },
        ]}
      >
        {piece}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  piece: {
    fontWeight: 'bold',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
