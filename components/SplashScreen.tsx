import { COLORS } from '@/constants/colors';
import { Bot, Shield, Sparkles, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface SplashScreenProps {
  onComplete?: () => void;
  minDisplayTime?: number;
}

export default function SplashScreen({ onComplete, minDisplayTime = 2000 }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    { icon: Bot, text: 'AI-Powered Chess Engine', color: COLORS.primary },
    { icon: Users, text: 'Real-time Multiplayer', color: COLORS.secondary },
    { icon: Shield, text: 'Secure Authentication', color: COLORS.success },
    { icon: Sparkles, text: 'Smart Move Analysis', color: COLORS.ctaButton },
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          if (onComplete) {
            setTimeout(onComplete, 500);
          }
          return 100;
        }
        return prev + 2;
      });
    }, minDisplayTime / 50);

    const featureInterval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(featureInterval);
    };
  }, [minDisplayTime, onComplete, features.length]);

  const CurrentIcon = features[currentFeature].icon;

  return (
    <View style={styles.container}>
      {/* Main Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoWrapper}>
          <View style={styles.logoGradient} />
          <View style={styles.logoInner}>
            <Shield width={48} height={48} color={COLORS.primary} />
          </View>
          <View style={styles.logoSparkles}>
            <Sparkles width={24} height={24} color={COLORS.ctaButton} />
          </View>
        </View>

        <Text style={styles.title}>ChessMeet</Text>
        <Text style={styles.subtitle}>AI-Native Chess Experience</Text>
      </View>

      {/* Feature Showcase */}
      <View style={styles.featureContainer}>
        <View style={styles.featureRow}>
          <CurrentIcon width={32} height={32} color={features[currentFeature].color} />
          <Text style={styles.featureText}>{features[currentFeature].text}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Loading...</Text>
          <Text style={styles.progressLabel}>{Math.round(progress)}%</Text>
        </View>
      </View>

      {/* Loading States */}
      <View style={styles.loadingStates}>
        <Text style={[styles.loadingText, progress > 20 && styles.loadingTextActive]}>
          ✓ Initializing chess engine
        </Text>
        <Text style={[styles.loadingText, progress > 40 && styles.loadingTextActive]}>
          ✓ Loading AI models
        </Text>
        <Text style={[styles.loadingText, progress > 60 && styles.loadingTextActive]}>
          ✓ Connecting to servers
        </Text>
        <Text style={[styles.loadingText, progress > 80 && styles.loadingTextActive]}>
          ✓ Preparing game interface
        </Text>
      </View>

      {/* Floating Chess Pieces */}
      <View style={styles.floatingPieces}>
        {['♔', '♕', '♖', '♗', '♘', '♙'].map((piece, index) => (
          <Animated.Text
            key={index}
            style={[
              styles.piece,
              {
                left: `${10 + index * 15}%`,
                top: `${20 + (index % 2) * 60}%`,
              },
            ]}
          >
            {piece}
          </Animated.Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoWrapper: {
    width: 96,
    height: 96,
    marginBottom: 24,
    position: 'relative',
  },
  logoGradient: {
    position: 'absolute',
    inset: 0,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
  },
  logoInner: {
    position: 'absolute',
    inset: 8,
    borderRadius: 16,
    backgroundColor: COLORS.whitetext,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSparkles: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.blacktext,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.blacktext,
    fontWeight: '500',
  },
  featureContainer: {
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 18,
    color: COLORS.whitetext,
    fontWeight: '500',
  },
  progressContainer: {
    width: '75%',
    marginBottom: 24,
  },
  progressBackground: {
    height: 8,
    backgroundColor: COLORS.muted,
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.blacktext,
  },
  loadingStates: {
    marginTop: 8,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 2,
  },
  loadingTextActive: {
    color: COLORS.foreground,
  },
  floatingPieces: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  piece: {
    position: 'absolute',
    fontSize: 32,
    color: COLORS.foreground,
    opacity: 0.1,
  },
});
