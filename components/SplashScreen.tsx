// ============================ screens/SplashScreen.tsx ============================
import { COLORS } from '@/constants/colors';
import { RootState } from '@/store';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import ChessPiece from '../components/ChessPiece';

const { height } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const piecesFadeAnim = useRef(new Animated.Value(0)).current;
  const piecesTranslateY = useRef(new Animated.Value(50)).current;

  // ✅ Redux auth state : on check si un token existe
  const { token, loading } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = !!token;

  useEffect(() => {
    // Animation logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation des pièces
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(piecesFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(piecesTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
      ]).start();
    }, 400);

    // ✅ Navigation après 3s (ajustable)
    // const timer = setTimeout(() => {
    //   if (loading) return; // on attend que l'hydratation soit finie

    //   if (isAuthenticated) {
    //     navigation.replace('Lobby'); // user déjà connecté
    //   } else {
    //     navigation.replace('GetStarted'); // première utilisation ou pas loggé
    //   }
    // }, 3000);

    return;
  }, [isAuthenticated, loading, fadeAnim, scaleAnim, piecesFadeAnim, piecesTranslateY]);

  return (
    <LinearGradient
      colors={['#81b64c', '#5e7c47']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* LOGO */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.pawnIcon}>
          <ChessPiece type="pawn" color="white" size={60} />
        </View>
        <Text style={styles.title}>Chess</Text>
        <Text style={styles.subtitle}>Meet</Text>
      </Animated.View>

      {/* PIÈCES */}
      <Animated.View
        style={[
          styles.piecesContainer,
          {
            opacity: piecesFadeAnim,
            transform: [{ translateY: piecesTranslateY }],
          },
        ]}
      >
        <View style={styles.pieceWrapper}>
          <ChessPiece type="knight" color="black" size={80} />
        </View>
        <View style={styles.centerPieceWrapper}>
          <ChessPiece type="pawn" color="white" size={90} />
        </View>
        <View style={styles.pieceWrapper}>
          <ChessPiece type="rook" color="black" size={80} />
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 60 },
  pawnIcon: {
    marginBottom: 20,
    shadowColor: COLORS.blacktext,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.whitetext,
    letterSpacing: 2,
    textShadowColor: COLORS.textShadowColor,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 24,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: -5,
    letterSpacing: 4,
  },
  piecesContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: height * 0.15,
    alignItems: 'flex-end',
    gap: 20,
  },
  pieceWrapper: { opacity: 0.6 },
  centerPieceWrapper: { marginBottom: -10 },
});
