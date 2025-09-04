// screens/LessonScreen.tsx
import { COLORS } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// Use the same wooden background for consistency
import lobby from '../../assets/images/woodenbg.jpg';

export default function GameRules() {
  const router = useRouter();

  return (
    <ImageBackground source={lobby} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/main')}>
            <ArrowLeft size={28} color={'#FFF8E1'} />
          </TouchableOpacity>

          <Text style={styles.title}>How to Play Chess</Text>

          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Objective</Text>
            <Text style={styles.paragraph}>
              The goal of chess is to checkmate your opponent&apos;s king. This means the king is in
              a position to be captured (&quot;in check&quot;) and cannot escape.
            </Text>

            <Text style={styles.sectionTitle}>Board Setup</Text>
            <Text style={styles.paragraph}>
              The chessboard has 64 squares arranged in an 8×8 grid. Each player starts with 16
              pieces: 1 king, 1 queen, 2 rooks, 2 knights, 2 bishops, and 8 pawns.
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
            <Text style={styles.paragraph}>
              ♙ Pawn – Moves forward one square (two on first move).
            </Text>

            <Text style={styles.sectionTitle}>Winning</Text>
            <Text style={styles.paragraph}>
              A game is won by checkmating the opponent&apos;s king. Games can also end in a draw
              under certain conditions.
            </Text>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

// ✅ NEW Styles for the wooden, game-like UI
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay, // Slightly darker overlay for better text focus
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 80, // More space for the title
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 8,
    zIndex: 10,
  },
  title: {
    fontFamily: 'CinzelDecorative-Bold',
    fontSize: 34,
    color: COLORS.buttonText,
    marginBottom: 30,
    textAlign: 'center',
    textShadowColor: COLORS.otpInput,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  content: {
    paddingBottom: 40,
    backgroundColor: COLORS.otpInput, // Dark, semi-transparent parchment background
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderWidth,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.borderColor, // Gold color for section titles
    marginTop: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderWidth,
    paddingBottom: 5,
  },
  paragraph: {
    fontSize: 16,
    color: COLORS.sub,
    lineHeight: 24,
    marginBottom: 12,
  },
});
