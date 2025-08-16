import { COLORS } from '@/constants/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { RootStackParamList } from '../types/navigation';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'GetStarted'>;

export default function GetStarted({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: 'https://digital-game-technology-2021.imgix.net/media/Headers/dgt-electronic-plastic-chess-pieces.jpg?auto=format&crop=focalpoint&domain=digital-game-technology-2021.imgix.net&fit=crop&fp-x=0.5&fp-y=0.5&h=721&ixlib=php-3.3.1&q=82&w=1081',
        }}
        style={styles.heroImage}
        resizeMode="contain"
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>Welcome to ChessMeet</Text>
        <Text style={styles.subtitle}>
          Play chess against AI or real players, get instant move suggestions, and master your game!
        </Text>
      </View>

      <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('SignIn')}>
        <Text style={styles.ctaText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.blacktext,
    alignItems: 'center', // horizontal centering
    justifyContent: 'center', // vertical centering
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  heroImage: {
    width: width * 0.7, // slightly smaller to fit center
    height: width * 0.7,
    marginBottom: 30, // space between image and text
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40, // space between text and button
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
    backgroundColor: COLORS.ctaButton,
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
