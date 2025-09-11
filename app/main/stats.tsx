/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from '@/lib/api';
import { useAppSelector } from '@/redux/slices/hooks'; // adjust path
import { UserStats } from '@/types/types';
import React from 'react';

import { Dimensions, ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import lobby from '../../assets/images/woodenbg.jpg';

const { width } = Dimensions.get('window');
const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedView = Animated.createAnimatedComponent(View);

interface GameHistory {
  _id: string;
  result: 'win' | 'loss' | 'draw';
  opponent: string;
  gameType: 'ai' | 'online' | 'local';
  duration: number;
  date: string;
  reason: 'checkmate' | 'resign' | 'timeout' | 'stalemate' | 'draw';
}

const initialStats: UserStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  resigned: 0,
  rating: 1200,
};

/* ---------------- Floating Chess Piece ---------------- */
const FloatingPiece = ({ symbol, index }: { symbol: string; index: number }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.1);
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withDelay(index * 500, withTiming(-30, { duration: 4000 })),
        withTiming(30, { duration: 4000 })
      ),
      -1,
      true
    );

    opacity.value = withRepeat(
      withSequence(
        withDelay(index * 300, withTiming(0.3, { duration: 2000 })),
        withTiming(0.1, { duration: 2000 })
      ),
      -1,
      true
    );

    rotation.value = withRepeat(withTiming(360, { duration: 10000 }), -1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { rotate: `${rotation.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedText
      style={[
        styles.floatingPiece,
        {
          left: `${10 + index * 15}%`,
          top: `${15 + (index % 3) * 25}%`,
        },
        animatedStyle,
      ]}
    >
      {symbol}
    </AnimatedText>
  );
};

/* ---------------- Stat Card ---------------- */
const StatCard = ({
  title,
  value,
  subtitle,
  color,
  icon,
  delay = 0,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
  icon: string;
  delay?: number;
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withDelay(
      delay,
      withSequence(withTiming(1.1, { duration: 300 }), withTiming(1, { duration: 200 }))
    );
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedView style={[styles.statCard, animatedStyle]}>
      <View style={[styles.statCardHeader, { backgroundColor: color }]}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <View style={styles.statCardContent}>
        <Text style={styles.statValue}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </AnimatedView>
  );
};

/* ---------------- Game History Item ---------------- */
const GameHistoryItem = ({ game, index }: { game: GameHistory; index: number }) => {
  const slideX = useSharedValue(-width);

  React.useEffect(() => {
    slideX.value = withDelay(index * 100, withTiming(0, { duration: 400 }));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }));

  const getResultColor = () => {
    switch (game.result) {
      case 'win':
        return '#4CAF50';
      case 'loss':
        return '#F44336';
      default:
        return '#FF9800';
    }
  };

  const getResultIcon = () => {
    switch (game.result) {
      case 'win':
        return '🏆';
      case 'loss':
        return '💔';
      default:
        return '🤝';
    }
  };

  const getGameTypeIcon = () => {
    switch (game.gameType) {
      case 'ai':
        return '🤖';
      case 'online':
        return '🌐';
      default:
        return '👥';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatedView style={[styles.historyItem, animatedStyle]}>
      <View style={[styles.historyResult, { backgroundColor: getResultColor() }]}>
        <Text style={styles.historyResultIcon}>{getResultIcon()}</Text>
      </View>

      <View style={styles.historyDetails}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyOpponent}>
            {getGameTypeIcon()} vs {game.opponent}
          </Text>
          <Text style={styles.historyDate}>{new Date(game.date).toLocaleDateString('en-US')}</Text>
        </View>

        <View style={styles.historyFooter}>
          <Text style={styles.historyReason}>
            {game.reason === 'checkmate'
              ? 'Checkmate'
              : game.reason === 'resign'
                ? 'Resigned'
                : game.reason === 'timeout'
                  ? 'Timeout'
                  : game.reason === 'stalemate'
                    ? 'Stalemate'
                    : 'Draw'}
          </Text>
          <Text style={styles.historyDuration}>{formatDuration(game.duration)}</Text>
        </View>
      </View>
    </AnimatedView>
  );
};

/* ---------------- Rating Chart ---------------- */
const RatingChart = ({ rating }: { rating: number }) => {
  const chartWidth = width * 0.8;
  const barHeight = useSharedValue(0);

  React.useEffect(() => {
    barHeight.value = withTiming(1, { duration: 1000 });
  }, []);

  const ratingColor = rating >= 1200 ? '#4CAF50' : rating >= 1000 ? '#FF9800' : '#F44336';

  const barStyle = useAnimatedStyle(() => ({
    width: interpolate(barHeight.value, [0, 1], [0, chartWidth], Extrapolation.CLAMP),
  }));

  return (
    <View style={styles.ratingChart}>
      <Text style={styles.ratingTitle}>Current Rating</Text>
      <View style={styles.chartContainer}>
        <AnimatedView style={[styles.ratingBar, { backgroundColor: ratingColor }, barStyle]} />
        <Text style={styles.ratingValue}>{rating}</Text>
      </View>
    </View>
  );
};

/* ---------------- Main Screen ---------------- */
export default function StatsScreen() {
  const token = useAppSelector((state) => state.auth.token);
  const [stats, setStats] = React.useState<UserStats>(initialStats);
  const [gameHistory, setGameHistory] = React.useState<GameHistory[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          console.warn('No token, skipping fetch');
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const statsRes = await api.get<UserStats>('/user/me/stats', { headers });
        setStats(statsRes.data);

        const historyRes = await api.get<GameHistory[]>('/user/me/games/history', { headers });
        setGameHistory(historyRes.data || []);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const chessSymbols = ['♔', '♕', '♖', '♗', '♘', '♙'];
  const winRate = stats.gamesPlayed > 0 ? ((stats.wins / stats.gamesPlayed) * 100).toFixed(1) : '0';

  return (
    <ImageBackground source={lobby} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        {/* Floating pieces */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {chessSymbols.map((symbol, index) => (
            <FloatingPiece key={index} symbol={symbol} index={index} />
          ))}
        </View>

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Statistics</Text>
            <Text style={styles.headerSubtitle}>Overview of your performance</Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <StatCard
              title="Games Played"
              value={stats.gamesPlayed}
              icon="♟"
              color="#8B4513"
              delay={100}
            />
            <StatCard
              title="Wins"
              value={stats.wins}
              subtitle={`${winRate}% wins`}
              icon="🏆"
              color="#4CAF50"
              delay={200}
            />
            <StatCard title="Losses" value={stats.losses} icon="💔" color="#F44336" delay={300} />
            <StatCard title="Draws" value={stats.draws} icon="🤝" color="#FF9800" delay={400} />
          </View>

          {/* Rating */}
          <RatingChart rating={stats.rating} />

          {/* History */}
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Recent Games</Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : gameHistory.length > 0 ? (
              gameHistory
                .slice(0, 10)
                .map((game, index) => <GameHistoryItem key={game._id} game={game} index={index} />)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No games played recently</Text>
                <Text style={styles.emptyStateSubtext}>Start playing to see your stats!</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontFamily: 'CinzelDecorative-Bold',
    fontSize: 32,
    color: '#FFF8E1',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#D4AF37',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 30,
  },
  statCard: {
    width: (width - 55) / 2,
    backgroundColor: 'rgba(30, 30, 45, 0.9)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#D4AF37',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  statCardHeader: {
    padding: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  statIcon: {
    fontSize: 20,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF8E1',
  },
  statCardContent: {
    padding: 15,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 5,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#E0E0E0',
    textAlign: 'center',
  },
  ratingChart: {
    backgroundColor: 'rgba(30, 30, 45, 0.9)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#D4AF37',
    padding: 20,
    marginBottom: 30,
    elevation: 5,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF8E1',
    marginBottom: 15,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  ratingBar: {
    height: 30,
    borderRadius: 15,
    minWidth: 50,
  },
  ratingValue: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF8E1',
    alignSelf: 'center',
    lineHeight: 30,
  },
  historySection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF8E1',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'CinzelDecorative-Bold',
  },
  historyItem: {
    backgroundColor: 'rgba(30, 30, 45, 0.9)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    marginBottom: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 3,
  },
  historyResult: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  historyResultIcon: {
    fontSize: 24,
  },
  historyDetails: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyOpponent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF8E1',
    flex: 1,
  },
  historyDate: {
    fontSize: 12,
    color: '#D4AF37',
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyReason: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  historyDuration: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#D4AF37',
    fontSize: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#D4AF37',
    textAlign: 'center',
  },
  floatingPiece: {
    position: 'absolute',
    fontSize: 40,
    color: '#FFF8E1',
  },
});
