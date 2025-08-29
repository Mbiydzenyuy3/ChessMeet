import { COLORS } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useRouter } from 'expo-router';
import { Book, Bot, Users } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedText = Animated.createAnimatedComponent(Text);

export default function LobbyScreen() {
  const { user } = useAuth();
  const router = useRouter();

  // Scale animations for cards
  const multiplayerScale = useSharedValue(0.8);
  const aiScale = useSharedValue(0.8);
  const lessonsScale = useSharedValue(0.8);

  const multiplayerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: multiplayerScale.value }],
  }));
  const aiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: aiScale.value }],
  }));
  const lessonsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: lessonsScale.value }],
  }));

  React.useEffect(() => {
    multiplayerScale.value = withDelay(100, withSpring(1, { damping: 6 }));
    aiScale.value = withDelay(250, withSpring(1, { damping: 6 }));
    lessonsScale.value = withDelay(400, withSpring(1, { damping: 6 }));
  }, []);

  // Floating pieces
  const floatingPieces = Array.from({ length: 6 }).map((_, i) => ({
    translateY: useSharedValue(0),
    opacity: useSharedValue(0.1),
    delay: i * 300,
  }));

  const pairPlayer = async () => {
    try {
      const res = await api.post(`http://localhost:3000/api/matchmaking/join`);
      const data = await res.data;
      console.log('data', data);
      if (typeof data === 'string') {
        router.push('/main/WaitingScreen');
      } else {
        router.push('/main');
      }
    } catch (error) {
      console.error(error);
    }
  };
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
      {/* Header */}
      <View style={styles.header}>
        {/* Profile Icon 👇 */}
        <TouchableOpacity onPress={() => router.push('/main/profile')}>
          <View style={styles.headerItems}>
            <Text style={styles.welcome}>Welcome back, {user?.displayName || 'Guest'}!</Text>
            <Image
              source={{
                uri:
                  user?.avatarUrl ||
                  'https://i.pinimg.com/474x/fa/d5/e7/fad5e79954583ad50ccb3f16ee64f66d.jpg',
              }}
              style={styles.avatar}
            />
          </View>
        </TouchableOpacity>
      </View>
      {/* Game Options */}
      <View style={styles.cardsContainer}>
        <View>
          <Text style={styles.subtitle}>Choose your game mode</Text>
        </View>
        <AnimatedTouchable
          style={[styles.card, { backgroundColor: COLORS.primary }, multiplayerStyle]}
          onPress={() => router.push('/main/PlayLocal')}
        >
          <Users size={32} color="white" />
          <Text style={styles.cardTitle}>Play Offline</Text>
          <Text style={styles.cardDesc}>Play locally with other players</Text>
        </AnimatedTouchable>

        <AnimatedTouchable
          style={[styles.card, { backgroundColor: COLORS.primary }, multiplayerStyle]}
          onPress={pairPlayer}
        >
          <Users size={32} color="white" />
          <Text style={styles.cardTitle}>Play vs Multiplayer</Text>
          <Text style={styles.cardDesc}>Compete online with players</Text>
        </AnimatedTouchable>

        <AnimatedTouchable
          style={[styles.card, { backgroundColor: COLORS.backgroundOne }, aiStyle]}
          onPress={() => router.push('/main')}
        >
          <Bot size={32} color="white" />
          <Text style={styles.cardTitle}>Play vs AI</Text>
          <Text style={styles.cardDesc}>Challenge the robot</Text>
        </AnimatedTouchable>

        <AnimatedTouchable
          style={[styles.card, { backgroundColor: COLORS.backgroundTwo }]}
          onPress={() => router.push('/main')}
        >
          <Book size={32} color="white" />
          <Text style={styles.cardTitle}>Game Rules</Text>
          <Text style={styles.cardDesc}>Learn how to win your first game and many more</Text>
        </AnimatedTouchable>
      </View>
      <View style={styles.cardsContainerTwo}>
        <AnimatedTouchable
          style={[styles.cardItems, { backgroundColor: COLORS.transparentBorder }, lessonsStyle]}
        ></AnimatedTouchable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BackgroundColor, padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 20,
  },

  welcome: { fontSize: 24, fontWeight: '700', color: COLORS.whitetext, marginBottom: 6 },
  subtitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.muted,
    marginTop: 40,
    marginBottom: 20,
  },

  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: -30,
    justifyContent: 'space-between',
  },
  cardsContainerTwo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 20,
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  cardItems: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  cardTitle: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
    marginTop: 10,
  },
  cardDesc: {
    color: COLORS.white,
    opacity: 0.8,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  floatingPiece: {
    position: 'absolute',
    fontSize: 48,
    color: COLORS.white,
    opacity: 0.08,
  },
  avatar: { width: 40, height: 40, borderRadius: 60, marginLeft: 24 },
  headerItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 10,
    gap: 40,
  },
});
