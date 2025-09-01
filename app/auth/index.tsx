import { COLORS } from '@/constants/colors';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import chessBg from '../../assets/images/chessbg.png';
const { width, height } = Dimensions.get('window');

export default function GetStarted() {
  const router = useRouter();
  return (
    <ImageBackground
      source={chessBg} // <-- use variable, not require()
      style={styles.background}
      resizeMode="cover"
    >
      {/* Dark cinematic overlay */}
      <View style={styles.overlay} />

      <View style={styles.content}>
        {/* Game Title */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>♔ ChessMeet ♚</Text>
          <Text style={styles.subtitle}>
            Master the board. Outsmart your rivals. Rule the game.
          </Text>
        </View>

        {/* Glowing Start Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.8}
          onPress={() => router.push('/auth/SignIn')}
        >
          <Text style={styles.ctaText}>Start Now</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlayBackground, // stronger cinematic overlay
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 32,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.whitetext,
    textAlign: 'center',
    textShadowColor: COLORS.shadeText,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 2,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.85,
  },
  ctaButton: {
    backgroundColor: COLORS.buttonOtp,
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
    elevation: 6,
    shadowColor: COLORS.buttonOtp,
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  ctaText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
