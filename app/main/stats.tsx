/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import { COLORS } from '@/constants/colors';
import { UserStats } from '@/types/types';
import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  // TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import lobby from '../../assets/images/woodenbg.jpg';
// import { api } from '@/lib/api';

const { width } = Dimensions.get('window');
// const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
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

// Composant pour une pièce flottante animée
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

// Composant pour une carte de statistique avec animation
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

// Composant pour l'historique des parties
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
          <Text style={styles.historyDate}>{new Date(game.date).toLocaleDateString('fr-FR')}</Text>
        </View>

        <View style={styles.historyFooter}>
          <Text style={styles.historyReason}>
            {game.reason === 'checkmate'
              ? 'Échec et mat'
              : game.reason === 'resign'
                ? 'Abandon'
                : game.reason === 'timeout'
                  ? 'Temps écoulé'
                  : game.reason === 'stalemate'
                    ? 'Pat'
                    : 'Match nul'}
          </Text>
          <Text style={styles.historyDuration}>{formatDuration(game.duration)}</Text>
        </View>
      </View>
    </AnimatedView>
  );
};

// Composant pour le graphique de progression du rating
const RatingChart = ({ rating }: { rating: number }) => {
  const chartWidth = width * 0.8;
  const barHeight = useSharedValue(0);
  const ratingColor = rating >= 1200 ? '#4CAF50' : rating >= 1000 ? '#FF9800' : '#F44336';

  React.useEffect(() => {
    barHeight.value = withDelay(600, withTiming(rating / 2000, { duration: 1000 }));
  }, [rating]);

  const barStyle = useAnimatedStyle(() => ({
    width: interpolate(barHeight.value, [0, 1], [0, chartWidth], Extrapolation.CLAMP),
  }));

  return (
    <View style={styles.ratingChart}>
      <Text style={styles.ratingTitle}>Rating Actuel</Text>
      <View style={styles.chartContainer}>
        <AnimatedView style={[styles.ratingBar, { backgroundColor: ratingColor }, barStyle]} />
        <Text style={styles.ratingValue}>{rating}</Text>
      </View>
    </View>
  );
};

export default function StatsScreen() {
  const [stats] = React.useState<UserStats>(initialStats);
  const [gameHistory, setGameHistory] = React.useState<GameHistory[]>([]);
  const [loading] = React.useState(false);

  React.useEffect(() => {
    setGameHistory([
      {
        _id: '1',
        result: 'win',
        opponent: 'IA Niveau 3',
        gameType: 'ai',
        duration: 845,
        date: new Date().toISOString(),
        reason: 'checkmate',
      },
      {
        _id: '2',
        result: 'loss',
        opponent: 'ChessMaster99',
        gameType: 'online',
        duration: 1245,
        date: new Date(Date.now() - 86400000).toISOString(),
        reason: 'resign',
      },
      {
        _id: '3',
        result: 'draw',
        opponent: 'LocalPlayer',
        gameType: 'local',
        duration: 2100,
        date: new Date(Date.now() - 172800000).toISOString(),
        reason: 'stalemate',
      },
    ]);
    // const fetchData = async () => {
    //   try {
    //     if (!token) return;
    //     const headers = { Authorization: `Bearer ${token}` };

    //     // Récupérer les statistiques
    //     const statsRes = await api.get<UserStats>('/user/me/stats', { headers });
    //     setStats(statsRes.data);

    //     // Récupérer l'historique des parties (simulé pour l'exemple)
    //     const historyRes = await api.get<GameHistory[]>('/user/me/games/history', { headers });
    //     setGameHistory(historyRes.data || []);
    //   } catch (err) {
    //     console.error('Failed to fetch stats data', err);
    //     // Données simulées en cas d'erreur

    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // fetchData();
  }, []);

  const chessSymbols = ['♔', '♕', '♖', '♗', '♘', '♙'];
  const winRate = stats.gamesPlayed > 0 ? ((stats.wins / stats.gamesPlayed) * 100).toFixed(1) : '0';

  return (
    <ImageBackground source={lobby} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        {/* Pièces flottantes en arrière-plan */}
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
          {/* En-tête des statistiques */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Statistics</Text>
            <Text style={styles.headerSubtitle}>Overview of your performance</Text>
          </View>

          {/* Cartes de statistiques */}
          <View style={styles.statsGrid}>
            <StatCard
              title="Parties Jouées"
              value={stats.gamesPlayed}
              icon="♟"
              color="#8B4513"
              delay={100}
            />

            <StatCard
              title="Victoires"
              value={stats.wins}
              subtitle={`${winRate}% de victoires`}
              icon="🏆"
              color="#4CAF50"
              delay={200}
            />

            <StatCard title="Défaites" value={stats.losses} icon="💔" color="#F44336" delay={300} />

            <StatCard
              title="Matchs Nuls"
              value={stats.draws}
              icon="🤝"
              color="#FF9800"
              delay={400}
            />
          </View>

          {/* Graphique de rating */}
          <RatingChart rating={stats.rating} />

          {/* Historique des parties */}
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Recent Games</Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Chargement...</Text>
              </View>
            ) : gameHistory.length > 0 ? (
              gameHistory
                .slice(0, 10)
                .map((game, index) => <GameHistoryItem key={game._id} game={game} index={index} />)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Aucune partie jouée récemment</Text>
                <Text style={styles.emptyStateSubtext}>
                  Commencez à jouer pour voir vos statistiques !
                </Text>
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
