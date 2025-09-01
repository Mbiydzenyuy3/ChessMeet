import { COLORS } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import React from 'react';
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import Game from '../../assets/images/threeheadpiece.png';
import lobby from '../../assets/images/woodenbg.jpg';
export default function LobbyScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const AnimatedText = Animated.createAnimatedComponent(Text);

  // Scale animations for cards
  const multiplayerScale = useSharedValue(0.8);
  const aiScale = useSharedValue(0.8);
  const lessonsScale = useSharedValue(0.8);

  React.useEffect(() => {
    multiplayerScale.value = withDelay(100, withSpring(1, { damping: 6 }));
    aiScale.value = withDelay(250, withSpring(1, { damping: 6 }));
    lessonsScale.value = withDelay(400, withSpring(1, { damping: 6 }));
  }, []);

  const floatingPieces = Array.from({ length: 6 }).map((_, i) => ({
    translateY: useSharedValue(0),
    opacity: useSharedValue(0.1),
    delay: i * 300,
  }));

  React.useEffect(() => {
    floatingPieces.forEach((piece) => {
      piece.translateY.value = withRepeat(
        withSequence(
          withDelay(piece.delay, withTiming(-20, { duration: 3000 })),
          withTiming(20, { duration: 3000 })
        ),
        -1,
        true
      );
    });
  }, []);

  const chessSymbols = ['♔', '♕', '♖', '♗', '♘', '♙'];

  return (
    <View style={styles.container}>
      {/* Floating background pieces */}
      <View style={StyleSheet.absoluteFill}>
        {chessSymbols.map((piece, index) => {
          const style = useAnimatedStyle(() => ({
            transform: [{ translateY: floatingPieces[index].translateY.value }],
            opacity: floatingPieces[index].opacity.value,
          }));
          return (
            <AnimatedText
              key={index}
              style={[
                styles.floatingPiece,
                {
                  left: `${10 + index * 15}%`,
                  top: `${20 + (index % 2) * 40}%`,
                },
                style,
              ]}
            >
              {piece}
            </AnimatedText>
          );
        })}
      </View>
      <ImageBackground
        source={lobby} // ✅ wooden background
        style={styles.background}
        resizeMode="cover"
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.headerItems}>
            <TouchableOpacity>
              <Image
                source={{
                  uri:
                    user?.avatarUrl ||
                    'https://i.pinimg.com/474x/fa/d5/e7/fad5e79954583ad50ccb3f16ee64f66d.jpg',
                }}
                style={styles.avatar}
              />
            </TouchableOpacity>
            <Text style={styles.welcome}> {user?.displayName || 'Guest'}</Text>
          </View>
          {/* <Image
          source={{ uri: 'https://i.pravatar.cc/150?img=12' }} // replace with real avatar
          style={styles.avatar}
        /> */}

          <TouchableOpacity style={styles.settingsBtn}>
            <Settings color="#fff" size={20} />
          </TouchableOpacity>
        </View>

        {/* Chess Icon Center */}
        <View style={styles.centerPiece}>
          <Image
            source={Game} // King + Knights logo
            style={{ width: 180, height: 180, resizeMode: 'contain' }}
          />
        </View>

        {/* Choose Mode */}
        <Text style={styles.chooseText}>CHOOSE YOUR MODE</Text>

        {/* Buttons */}
        <TouchableOpacity style={styles.modeBtn} onPress={() => router.push('/main/PlayLocal')}>
          <Text style={styles.modeText}>♟ VS PLAYER</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modeBtn} onPress={() => router.push('/main/ai')}>
          <Text style={styles.modeText}>♟ VS COMPUTER</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modeBtn} onPress={() => router.push('/main/multiplayer')}>
          <Text style={styles.modeText}>♟ VS MULTIPLAYERS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modeBtn} onPress={() => router.push('/main/lesson')}>
          <Text style={styles.modeText}>♟ GAME RULES</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  floatingPiece: { position: 'absolute', fontSize: 48, color: COLORS.white, opacity: 0.08 },
  background: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 50 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.profileCard,
    padding: 10,
    borderRadius: 12,
    // marginBottom: 30,
    width: '90%',
    justifyContent: 'space-between',
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  // playerName: { color: COLORS.white, fontWeight: '700', fontSize: 16, fontFamily: 'Supercaver' },
  // playerStats: { color: COLORS.playState, fontSize: 12 },
  settingsBtn: {
    backgroundColor: COLORS.settingsBtn,
    padding: 6,
    marginBottom: 6,
    borderRadius: 20,
  },
  welcome: { fontSize: 24, fontWeight: '700', color: COLORS.whitetext },
  centerPiece: {
    marginTop: 40,
    marginBottom: 30,
    alignItems: 'center',
  },
  chooseText: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: '800',
    marginBottom: 20,
    fontFamily: 'MidnightMinutes',
  },
  headerItems: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: 20,
  },
  modeBtn: {
    backgroundColor: COLORS.modeBtn,
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
  },
  modeText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'MidnightMinutes',
  },
});
