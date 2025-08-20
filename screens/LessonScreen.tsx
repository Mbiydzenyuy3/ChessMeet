// screens/LessonsScreen.tsx
import { COLORS } from '@/constants/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { RootStackParamList } from '../../ChessMeet/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'GameRules'>;

export default function GameRules({ navigation }: Props) {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ArrowLeft size={24} color={COLORS.white} />
      </TouchableOpacity>

      <Text style={styles.title}>How to Play Chess</Text>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Objective</Text>
        <Text style={styles.paragraph}>
          The goal of chess is to checkmate your opponent&apos;s king. This means the king is in a
          position to be captured (&quot;in check&quot;) and cannot escape.
        </Text>

        <Text style={styles.sectionTitle}>Board Setup</Text>
        <Text style={styles.paragraph}>
          The chessboard has 64 squares arranged in an 8×8 grid. Each player starts with 16 pieces:
          1 king, 1 queen, 2 rooks, 2 knights, 2 bishops, and 8 pawns.
        </Text>

        <Text style={styles.sectionTitle}>Piece Movement</Text>
        <Text style={styles.paragraph}>♔ King – Moves one square in any direction.</Text>
        <Text style={styles.paragraph}>
          ♕ Queen – Moves any number of squares in any direction.
        </Text>
        <Text style={styles.paragraph}>
          ♖ Rook – Moves in straight lines (horizontal/vertical).
        </Text>
        <Text style={styles.paragraph}>♗ Bishop – Moves diagonally.</Text>
        <Text style={styles.paragraph}>♘ Knight – Moves in an &quot;L&quot; shape.</Text>
        <Text style={styles.paragraph}>♙ Pawn – Moves forward one square (two on first move).</Text>

        <Text style={styles.sectionTitle}>Winning</Text>
        <Text style={styles.paragraph}>
          A game is won by checkmating the opponent&apos;s king. Games can also end in a draw under
          certain conditions.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BackgroundColor,
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 8,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  content: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 20,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 14,
    color: COLORS.whitetext,
    lineHeight: 20,
    marginBottom: 10,
  },
});
