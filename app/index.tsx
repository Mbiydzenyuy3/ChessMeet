import { COLORS } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
import React, { useEffect } from 'react';
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { RootStackParamList } from '../types/navigation';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'GetStarted'>;

export default function GetStarted({ navigation }: Props) {
  const { isAuthenticated, bootstrapAuth } = useAuth();

  // 1️⃣ Set audio
  useEffect(() => {
    const setAudioMode = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.warn('Failed to set audio mode:', error);
      }
    };
    setAudioMode();
  }, []);

  // 2️⃣ Bootstrap auth on mount
  useEffect(() => {
    const initAuth = async () => {
      await bootstrapAuth();
      if (isAuthenticated) {
        navigation.replace('Lobby');
      }
    };
    initAuth();
  }, [isAuthenticated, bootstrapAuth, navigation]);

  return (
    <ImageBackground
      source={{
        uri: './images/chesspiecesbg.avif',
      }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>ChessMeet</Text>
          <Text style={styles.subtitle}>
            Play chess against AI or real players, get instant move suggestions, and master your
            game
          </Text>
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.ctaText}>Get Started</Text>
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
    backgroundColor: COLORS.Overlaybg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 32,
    marginTop: 164,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 36,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.whitetext,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: COLORS.bgMossGreen,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    elevation: 3,
  },
  ctaText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
