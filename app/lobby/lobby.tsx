// screens/LobbyScreen.tsx
import { COLORS } from '@/constants/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Book, Bot, Users } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { RootStackParamList } from '../../types/navigation';

// const { width, height } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedText = Animated.createAnimatedComponent(Text);
type Props = NativeStackScreenProps<RootStackParamList, 'Lobby'>;

export default function LobbyScreen({ navigation }: Props) {
  // Scale animations for cards
  const multiplayerScale = useSharedValue(0.8);
  const aiScale = useSharedValue(0.8);
  const lessonsScale = useSharedValue(0.8);
  // const playButtonScale = useSharedValue(1);

  const multiplayerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: multiplayerScale.value }],
  }));
  const aiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: aiScale.value }],
  }));
  const lessonsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: lessonsScale.value }],
  }));
  // const playButtonStyle = useAnimatedStyle(() => ({
  //   transform: [{ scale: playButtonScale.value }],
  // }));

  // Animate cards on mount
  React.useEffect(() => {
    multiplayerScale.value = withDelay(100, withSpring(1, { damping: 6 }));
    aiScale.value = withDelay(250, withSpring(1, { damping: 6 }));
    lessonsScale.value = withDelay(400, withSpring(1, { damping: 6 }));
  }, []);

  // Floating pieces shared values
  const floatingPieces = Array.from({ length: 6 }).map((_, i) => ({
    translateY: useSharedValue(0),
    opacity: useSharedValue(0.1),
    delay: i * 300,
  }));

  // Animate floating pieces (looping up & down)
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

  // Play button bounce
  // const handlePlayPress = () => {
  //   playButtonScale.value = withSequence(withSpring(0.9), withSpring(1.05), withSpring(1));
  //   // navigation logic here
  // };

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
      <Text style={styles.welcome}>ChessMeet</Text>
      <Text style={styles.subtitle}>Choose your game mode</Text>

      {/* Game Options */}
      <View style={styles.cardsContainer}>
        <AnimatedTouchable
          style={[styles.card, { backgroundColor: COLORS.primary }, multiplayerStyle]}
          onPress={() => navigation.navigate('Local')}
        >
          <Users size={32} color="white" />
          <Text style={styles.cardTitle}>Play Offline</Text>
          <Text style={styles.cardDesc}>Play on locally with other players</Text>
        </AnimatedTouchable>
        <AnimatedTouchable
          style={[styles.card, { backgroundColor: COLORS.primary }, multiplayerStyle]}
          onPress={() => navigation.navigate('Multiplayer')}
        >
          <Users size={32} color="white" />
          <Text style={styles.cardTitle}>Play vs Multiplayer</Text>
          <Text style={styles.cardDesc}>Compete in real time online with other players</Text>
        </AnimatedTouchable>

        <AnimatedTouchable
          style={[styles.card, { backgroundColor: COLORS.backgroundOne }, aiStyle]}
          onPress={() => navigation.navigate('AI')}
        >
          <Bot size={32} color="white" />
          <Text style={styles.cardTitle}>Play vs AI</Text>
          <Text style={styles.cardDesc}>Challenge the robot</Text>
        </AnimatedTouchable>

        <AnimatedTouchable
          style={[styles.card, { backgroundColor: COLORS.backgroundTwo }, lessonsStyle]}
          onPress={() => navigation.navigate('GameRules')}
        >
          <Book size={32} color="white" />
          <Text style={styles.cardTitle}>Game Rules</Text>
          <Text style={styles.cardDesc}>Your tour guide to winning your first game</Text>
        </AnimatedTouchable>
      </View>

      {/* Play Now Button */}
      {/* <AnimatedTouchable style={[styles.playButton, playButtonStyle]} onPress={handlePlayPress}>
        <Text style={styles.playText}>Play Now</Text>
      </AnimatedTouchable> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BackgroundColor,
    padding: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.whitetext,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.muted,
    marginBottom: 20,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
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
  cardTitle: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
    marginTop: 10,
  },
  cardDesc: {
    color: COLORS.white,
    opacity: 0.8,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  // playButton: {
  //   backgroundColor: COLORS.ctaButton,
  //   paddingVertical: 16,
  //   borderRadius: 30,
  //   marginTop: 'auto',
  //   alignItems: 'center',
  //   elevation: 6,
  // },
  // playText: {
  //   color: COLORS.white,
  //   fontSize: 18,
  //   fontWeight: '700',
  // },
  floatingPiece: {
    position: 'absolute',
    fontSize: 48,
    color: COLORS.white,
    opacity: 0.08,
  },
});
