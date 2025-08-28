import api from '@/api/api';
import StatsCard from '@/components/StatsCard';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { UserStats } from '@/types/types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedText = Animated.createAnimatedComponent(Text);

// interface Game {
//   _id: string;
//   status: string;
//   whitePlayer: { _id: string; displayName?: string; avatarUrl?: string };
//   blackPlayer: { _id: string; displayName?: string; avatarUrl?: string };
// }

const initialStats: UserStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  resigned: 0,
  rating: 1200,
};

export default function LobbyScreen() {
  const { token } = useAuth();

  const [stats, setStats] = React.useState<UserStats>(initialStats);
  // const [history, setHistory] = React.useState<Game[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        // fetch stats
        const statsRes = await api.get<UserStats>('/user/me/stats', { headers });
        setStats(statsRes.data);

        // // fetch game history
        // const historyRes = await api.get<Game[]>('/games/my/history?limit=5', { headers });
        // setHistory(historyRes.data);
      } catch (err) {
        console.error('Failed to fetch lobby data', err);
      }
    };

    fetchData();
  }, [token]);

  // Floating pieces
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

      <View style={styles.cardsContainerTwo}>
        <AnimatedTouchable style={[styles.card, { backgroundColor: COLORS.backgroundOne }]}>
          <View>
            <AnimatedTouchable
            // style={[styles.card, { backgroundColor: COLORS.backgroundTwo }, lessonsStyle]}
            >
              <StatsCard stats={stats} />
            </AnimatedTouchable>
          </View>
        </AnimatedTouchable>
        {/* <AnimatedTouchable style={[styles.card, { backgroundColor: COLORS.backgroundOne }]}>
          <View>
            {history.length > 0 ? (
              history.map((game) => (
                <View key={game._id} style={styles.historyItem}>
                  <Text style={styles.historyText}>
                    {game.whitePlayer.displayName || 'White'} vs{' '}
                    {game.blackPlayer.displayName || 'Black'} — {game.status}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.loading}>No game history yet.</Text>
            )}
          </View> */}
        {/* </AnimatedTouchable> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BackgroundColor, padding: 20 },

  // historyItem: {
  //   paddingVertical: 8,
  //   borderBottomWidth: 1,
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   gap: 60,
  //   borderBottomColor: COLORS.border,
  // },
  // historyText: {
  //   color: COLORS.white,
  //   fontSize: 14,
  // },

  // loading: {
  //   fontSize: 16,
  //   color: COLORS.white,
  //   textAlign: 'center',
  // },

  cardsContainerTwo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 20,
    justifyContent: 'space-between',
  },
  card: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    // justifyContent: 'center',
    // alignItems: 'center',
    elevation: 4,
  },

  floatingPiece: {
    position: 'absolute',
    fontSize: 48,
    color: COLORS.white,
    opacity: 0.08,
  },
});
