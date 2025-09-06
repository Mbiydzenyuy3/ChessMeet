/* eslint-disable react-native/no-unused-styles */
/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable react-native/no-color-literals */
// /* eslint-disable react-native/no-inline-styles */
// /* eslint-disable @typescript-eslint/no-explicit-any */

import { COLORS } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import FloatingPiece from '../../components/FloatingPiece';
import TransitionScreen from '../../components/TransitionScreen';
import { useAppDispatch } from '../../store';
import { setMode, updateFromGameObject } from '../../store/gameSlice';

import { useAudioPlayer } from 'expo-audio';
import Game from '../../assets/images/threeheadpiece.png';
import lobby from '../../assets/images/woodenbg.jpg';
import clickSound from '../../assets/sound/click.mp3';

// -----------------------------------------------

const { width } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface RecentGame {
  _id: string;
  result: 'win' | 'loss' | 'draw';
  opponent: string;
  gameType: 'ai' | 'online' | 'local';
  date: string;
  duration: number;
}

// Composant pour afficher une partie récente
const RecentGameCard = ({ game, index }: { game: RecentGame; index: number }) => {
  const slideX = useSharedValue(-width);
  const scale = useSharedValue(0.8);

  React.useEffect(() => {
    slideX.value = withDelay(index * 150, withTiming(0, { duration: 500 }));
    scale.value = withDelay(index * 150, withTiming(1, { duration: 400 }));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }, { scale: scale.value }],
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Aujourd'hui";
    if (diffDays === 2) return 'Hier';
    if (diffDays <= 7) return `Il y a ${diffDays - 1} jours`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}min`;
  };

  return (
    <AnimatedTouchable style={[styles.recentGameCard, animatedStyle]}>
      <View style={[styles.gameResultBadge, { backgroundColor: getResultColor() }]}>
        <Text style={styles.gameResultIcon}>{getResultIcon()}</Text>
      </View>

      <View style={styles.gameInfo}>
        <View style={styles.gameHeader}>
          <Text style={styles.gameOpponent} numberOfLines={1}>
            {getGameTypeIcon()} {game.opponent}
          </Text>
          <Text style={styles.gameDuration}>{formatDuration(game.duration)}</Text>
        </View>
        <Text style={styles.gameDate}>{formatDate(game.date)}</Text>
      </View>
    </AnimatedTouchable>
  );
};

// Composant pour le bouton de mode de jeu avec animation
const AnimatedGameModeButton = ({
  title,
  onPress,
  delay = 0,
}: {
  title: string;
  onPress: () => void;
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
    <AnimatedTouchable
      style={[styles.modeBtn, styles.shadow, animatedStyle]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.modeText}>{title}</Text>
    </AnimatedTouchable>
  );
};

// -------------------------------------------------
export default function LobbyScreen() {
  const click = useAudioPlayer(clickSound);
  const socket = useSocket();
  const router = useRouter();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [gameModeAction, setGameModeAction] = useState<(() => void) | null>(null);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [showRecentGames, setShowRecentGames] = useState(false);

  // Animation pour le logo central
  const logoScale = useSharedValue(0);
  const logoRotation = useSharedValue(0);

  React.useEffect(() => {
    logoScale.value = withSequence(
      withTiming(1.2, { duration: 600 }),
      withTiming(1, { duration: 400 })
    );

    logoRotation.value = withRepeat(withTiming(2, { duration: 8000 }), -1, true);

    // Simuler des parties récentes
    setTimeout(() => {
      setRecentGames([
        {
          _id: '1',
          result: 'win',
          opponent: 'IA Niveau 3',
          gameType: 'ai',
          date: new Date().toISOString(),
          duration: 845,
        },
        {
          _id: '2',
          result: 'loss',
          opponent: 'ChessMaster99',
          gameType: 'online',
          date: new Date(Date.now() - 86400000).toISOString(),
          duration: 1245,
        },
        {
          _id: '3',
          result: 'draw',
          opponent: 'LocalFriend',
          gameType: 'local',
          date: new Date(Date.now() - 172800000).toISOString(),
          duration: 2100,
        },
      ]);
      setShowRecentGames(true);
    }, 1500);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${interpolate(logoRotation.value, [0, 2], [0, 4])}deg` },
    ],
  }));

  const onTransitionEnd = () => {
    if (gameModeAction) {
      gameModeAction();
      setIsTransitioning(false);
      setGameModeAction(null);
    }
  };

  const handleGameModeSelection = (action: () => void) => {
    setGameModeAction(() => action);
    setIsTransitioning(true);
  };

  function startAI() {
    console.log("Début du jeu contre l'IA");
    dispatch(setMode('ai'));
    socket.emit('createVsAI', { timeControl: '300+0' });
    socket.once('aiGameCreated', (data: any) => {
      console.log('📥 createVsAI reçu:', JSON.stringify(data, null, 2));

      if (data && data._id) {
        console.log('navigue vers game ');
        dispatch(updateFromGameObject(data));
        router.push('/main/game');
      } else {
        Alert.alert('Erreur', 'Impossible de créer la partie IA');
      }
    });
  }

  function joinQueue() {
    console.log('🔹 Rejoindre la file online');
    dispatch(setMode('online'));
    socket.emit('joinQueue', { timeControl: '300+0' });
    router.push('/main/machmakin');
  }

  const chessSymbols = ['♔', '♕', '♖', '♗', '♘', '♙'];

  if (isTransitioning) {
    return <TransitionScreen onAnimationFinish={onTransitionEnd} />;
  }

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {chessSymbols.map((symbol, index) => (
          <FloatingPiece key={index} symbol={symbol} index={index} />
        ))}
      </View>

      <ImageBackground source={lobby} style={styles.background} resizeMode="cover">
        <View style={styles.overlay}>
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Profile Card */}
            <AnimatedView style={[styles.profileCard, styles.shadow]}>
              <View style={styles.headerItems}>
                <TouchableOpacity
                  onPress={() => {
                    click.play();
                    router.push('/main/profile');
                  }}
                >
                  <Image
                    source={{
                      uri:
                        user?.avatarUrl ||
                        'https://i.pinimg.com/474x/fa/d5/e7/fad5e79954583ad50ccb3f16ee64f66d.jpg',
                    }}
                    style={styles.avatar}
                  />
                </TouchableOpacity>
                <Text style={styles.welcome}>{user?.displayName || 'Guest'}</Text>
              </View>

              <TouchableOpacity
                style={styles.settingsBtn}
                onPress={() => {
                  router.push('/settings/SettingsScreen');
                }}
              >
                <Settings color="#fff" size={20} onPress={() => click.play()} />
              </TouchableOpacity>
            </AnimatedView>

            {/* Chess Icon Center */}
            <AnimatedView style={[styles.centerPiece, logoAnimatedStyle]}>
              <Image source={Game} style={styles.gameImage} />
            </AnimatedView>

            {/* Choose Mode */}
            <Text style={styles.chooseText}>CHOOSE A GAME MODE</Text>

            {/* Game Mode Buttons */}
            <View style={styles.buttonContainer}>
              <AnimatedGameModeButton
                title="♟ PLAY OFFLINE"
                onPress={() => {
                  click.play();
                  handleGameModeSelection(() => router.push('/main/PlayLocal'));
                }}
                delay={200}
              />

              <AnimatedGameModeButton
                title="♟PLAY AGAINST AI"
                onPress={() => {
                  click.play();
                  handleGameModeSelection(startAI);
                }}
                delay={300}
              />

              <AnimatedGameModeButton
                title="♟ JOIN ONLINE"
                onPress={() => {
                  click.play();
                  handleGameModeSelection(joinQueue);
                }}
                delay={400}
              />

              <AnimatedGameModeButton
                title="♟ LEARN CHESS"
                onPress={() => {
                  click.play();
                  handleGameModeSelection(() => router.push('/settings/LessonScreen'));
                }}
                delay={500}
              />
            </View>

            {/* Recent Games Section */}
            {showRecentGames && recentGames.length > 0 && (
              <View style={styles.recentGamesSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Games</Text>
                  <TouchableOpacity
                    onPress={() => router.push('/main/stats')}
                    style={styles.viewAllButton}
                  >
                    <Text style={styles.viewAllText}>Voir tout</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recentGamesContainer}
                >
                  {recentGames.map((game, index) => (
                    <RecentGameCard key={game._id} game={game} index={index} />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Quick Stats */}
            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Parties</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Victoires</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>1247</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: '100%',
    height: '100%',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.profileCard,
    padding: 15,
    borderRadius: 15,
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  headerItems: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  welcome: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.whitetext,
  },
  settingsBtn: {
    backgroundColor: COLORS.settingsBtn,
    padding: 8,
    borderRadius: 25,
  },
  centerPiece: {
    alignItems: 'center',
    marginVertical: 20,
  },
  gameImage: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
  },
  chooseText: {
    fontSize: 20,
    color: COLORS.white,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'MidnightMinutes',
    letterSpacing: 1,
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 30,
  },
  modeBtn: {
    backgroundColor: COLORS.modeBtn,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  modeText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'MidnightMinutes',
    letterSpacing: 0.5,
  },
  recentGamesSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF8E1',
    fontFamily: 'CinzelDecorative-Bold',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  viewAllText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
  },
  recentGamesContainer: {
    paddingRight: 20,
  },
  recentGameCard: {
    width: 140,
    backgroundColor: 'rgba(30, 30, 45, 0.9)',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameResultBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  gameResultIcon: {
    fontSize: 16,
  },
  gameInfo: {
    flex: 1,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  gameOpponent: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF8E1',
    flex: 1,
  },
  gameDuration: {
    fontSize: 10,
    color: '#D4AF37',
    fontWeight: '600',
  },
  gameDate: {
    fontSize: 10,
    color: '#E0E0E0',
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 30, 45, 0.9)',
    borderRadius: 15,
    padding: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  statLabel: {
    fontSize: 12,
    color: '#E0E0E0',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
  },
});
