/* eslint-disable react-native/no-unused-styles */
/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Chess } from 'chess.js';
import {
  ArrowLeft,
  BookOpenIcon,
  DoorOpenIcon,
  FlagIcon,
  LightbulbIcon,
} from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  Modal,
  // Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import AssistantPanel from '../../components/AssistantPanel';
import MoveList from '../../components/MoveList';
import { useAppDispatch, useAppSelector } from '../../store';

import { useRouter } from 'expo-router';
import Chessboard, { ChessboardRef } from 'react-native-chessboard';
import { useSocket } from '../../hooks/useSocket';
import { newChess } from '../../lib/chess';
import {
  appendMove,
  resetGame,
  setLoading,
  setSuggestions,
  updateFromGameObject,
} from '../../store/gameSlice';

import lobby from '../../assets/images/woodenbg.jpg'; // Import the background

const { width, height } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);
// const AnimatedText = Animated.createAnimatedComponent(Text);

// Helper functions (extractLastMove, usePlayerColor) remain unchanged...
export function extractLastMove(prevFen: string, newFen: string) {
  const chessPrev = new Chess(prevFen);
  const chessNew = new Chess(newFen);

  const legalMoves = chessPrev.moves({ verbose: true });
  for (const move of legalMoves) {
    const clone = new Chess(prevFen);
    clone.move({ from: move.from, to: move.to, promotion: move.promotion });
    if (clone.fen() === newFen) {
      return { from: move.from, to: move.to, san: move.san };
    }
  }
  const history = chessNew.history({ verbose: true });
  const last = history[history.length - 1];
  if (last) {
    return { from: last.from, to: last.to, san: last.san };
  }
  return null;
}

export function usePlayerColor(): 'w' | 'b' | null {
  const user = useAppSelector((state) => state.auth.user);
  const { whitePlayer, blackPlayer } = useAppSelector((s) => s.game);
  if (!user?._id) return null;
  if (whitePlayer && String(whitePlayer) === String(user._id)) return 'w';
  if (blackPlayer && String(blackPlayer) === String(user._id)) return 'b';
  return null;
}

const router = useRouter();
// ✅ New component for the loading/waiting screen
const WaitingForOpponent = () => (
  <ImageBackground source={lobby} style={styles.background} resizeMode="cover">
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/main')}>
        <ArrowLeft size={28} color={'#FFF8E1'} />
      </TouchableOpacity>
      <View style={styles.waitingContainer}>
        <Text style={styles.waitingTitle}>Finding Opponent</Text>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.waitingText}>
          Please wait while we match you with another player...
        </Text>
      </View>
    </View>
  </ImageBackground>
);

// Composant pour les confettis animés
const ConfettiPiece = ({ index }: { index: number }) => {
  const translateY = useSharedValue(-height);
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(index * 50, withTiming(height + 100, { duration: 3000 }));

    translateX.value = withRepeat(
      withSequence(
        withTiming(Math.random() * 50 - 25, { duration: 800 }),
        withTiming(Math.random() * 50 - 25, { duration: 800 })
      ),
      -1,
      true
    );

    rotation.value = withRepeat(withTiming(360, { duration: 2000 }), -1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const colors = ['#FFD700', '#FF6B35', '#F7931E', '#FF1744', '#E91E63'];
  const confettiColor = colors[index % colors.length];

  return (
    <AnimatedView
      style={[
        styles.confetti,
        {
          backgroundColor: confettiColor,
          left: Math.random() * width,
        },
        animatedStyle,
      ]}
    />
  );
};

// Composant pour l'écran de fin de partie
const GameEndModal = ({
  visible,
  result,
  isWinner,
  onNewGame,
  onMainMenu,
}: {
  visible: boolean;
  result: string;
  isWinner: boolean;
  onNewGame: () => void;
  onMainMenu: () => void;
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const confettiVisible = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSequence(
        withTiming(1.1, { duration: 300 }),
        withTiming(1, { duration: 200 })
      );

      if (isWinner) {
        confettiVisible.value = withDelay(200, withTiming(1, { duration: 100 }));
      }
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0, { duration: 200 });
      confettiVisible.value = withTiming(0, { duration: 100 });
    }
  }, [visible, isWinner]);

  const modalStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const getResultText = () => {
    if (result === 'checkmate') {
      return isWinner ? 'VICTOIRE!' : 'DÉFAITE';
    } else if (result === 'stalemate' || result === 'draw') {
      return 'MATCH NUL';
    } else if (result === 'resigned') {
      return isWinner ? 'VICTOIRE PAR ABANDON' : 'ABANDON';
    }
    return 'PARTIE TERMINÉE';
  };

  const getResultIcon = () => {
    if (result === 'checkmate') {
      return isWinner ? '👑' : '💔';
    } else if (result === 'stalemate' || result === 'draw') {
      return '🤝';
    } else if (result === 'resigned') {
      return isWinner ? '🏆' : '😔';
    }
    return '⚡';
  };

  const getResultColor = () => {
    if (result === 'checkmate' || result === 'resigned') {
      return isWinner ? '#4CAF50' : '#F44336';
    }
    return '#FF9800';
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.gameEndOverlay}>
        {/* Confettis pour la victoire */}
        {isWinner && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {Array.from({ length: 20 }).map((_, i) => (
              <ConfettiPiece key={i} index={i} />
            ))}
          </View>
        )}

        <AnimatedView style={[styles.gameEndModal, modalStyle]}>
          <View style={[styles.gameEndHeader, { backgroundColor: getResultColor() }]}>
            <Text style={styles.gameEndIcon}>{getResultIcon()}</Text>
            <Text style={styles.gameEndTitle}>{getResultText()}</Text>
          </View>

          <View style={styles.gameEndContent}>
            <Text style={styles.gameEndSubtitle}>
              {result === 'checkmate' &&
                (isWinner ? 'Échec et mat! Great game!' : 'Échec et mat. Well done!')}
              {result === 'stalemate' && 'Stalemate position - equality'}
              {result === 'draw' && 'Draw by mutual agreement'}
              {result === 'resigned' &&
                (isWinner ? 'Your opponent has resigned' : 'You have given up the game')}
            </Text>

            <View style={styles.gameEndButtons}>
              {/* <TouchableOpacity style={styles.gameEndButton} onPress={onRematch}>
                <Text style={styles.gameEndButtonText}>🔄 Revenge</Text>
              </TouchableOpacity> */}

              <TouchableOpacity style={styles.gameEndButton} onPress={onNewGame}>
                <Text style={styles.gameEndButtonText}> New Part</Text>
              </TouchableOpacity>

              {/* <TouchableOpacity
                style={[styles.gameEndButton, styles.analyzeButton]}
                onPress={onAnalyze}
              >
                <Text style={styles.gameEndButtonText}>📊 Analyser (Bientôt)</Text>
              </TouchableOpacity> */}

              <TouchableOpacity
                style={[styles.gameEndButton, styles.menuButton]}
                onPress={onMainMenu}
              >
                <Text style={styles.gameEndButtonText}>🏠 Menu Principal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedView>
      </View>
    </Modal>
  );
};

// Composant modal amélioré pour mobile
const ImprovedModal = ({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  const translateY = useSharedValue(height);

  useEffect(() => {
    translateY.value = visible
      ? withTiming(0, { duration: 300 })
      : withTiming(height, { duration: 300 });
  }, [visible]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.improvedModalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <AnimatedView style={[styles.improvedModalContent, modalStyle]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>{children}</View>
        </AnimatedView>
      </View>
    </Modal>
  );
};

export default function GameScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const socket = useSocket();
  const boardRef = useRef<ChessboardRef>(null);
  const playerColor = usePlayerColor();
  const prevFenRef = useRef<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [gameEndData, setGameEndData] = useState<{
    visible: boolean;
    result: string;
    isWinner: boolean;
  }>({ visible: false, result: '', isWinner: false });

  console.log(`couleur du joueru ${playerColor}`);

  const { currentId, fen, moves, assistantEnabled, mode } = useAppSelector((s) => s.game);
  const user = useAppSelector((state) => state.auth.user);

  // Le tour (turn) est maintenant déduit directement de l'état "fen"

  const chess = useMemo(() => newChess(fen), [fen]);
  const turn = useMemo(() => chess.turn(), [chess]);

  const [showMoves, setShowMoves] = useState(false);
  const [showCoach, setShowCoach] = useState(false);

  // ✅ PREMIER useEffect : Gère l'initialisation des écouteurs de socket.
  // Ce hook ne s'exécute qu'une seule fois au montage du composant pour éviter de
  // recréer et supprimer constamment les écouteurs.
  useEffect(() => {
    if (!socket) return;
    let mounted = true;

    // Événements qui n'ont pas besoin de l'état du jeu (fen, etc.)
    socket.on('joined', (p: any) => {
      if (!mounted) return;
      console.log('📥 joined reçu:', JSON.stringify(p, null, 2));
    });

    socket.on('gameOver', (p: any) => {
      if (!mounted) return;
      console.log('📥 gameOver reçu:', JSON.stringify(p, null, 2));

      const userId = user?._id;
      const isWinner = p.winnerId === userId;

      setGameEndData({
        visible: true,
        result: p.result || 'unknown',
        isWinner,
      });
    });

    // socket.on('gameOver', (p: any) => {
    //   if (!mounted) return;
    //   console.log('📥 gameOver ⚠️ reçu:', JSON.stringify(p, null, 2));

    //   // L'ID utilisateur doit être récupéré de l'état global ou passé en paramètre
    //   const userId = user?._id;
    //   const isWinner = p.winnerId === userId;

    //   // if (p?.game) dispatch(updateFromGameObject(p.game));

    //   let message = 'La partie est terminée.';
    //   if (p.result === 'checkmate') {
    //     if (p.winnerId === userId) {
    //       message = 'Félicitations, vous avez gagné par échec et mat !';
    //     } else {
    //       message = 'Échec et mat ! Vous avez perdu.';
    //     }
    //   } else if (p.result === 'stalemate') {
    //     message = 'Pat ! La partie est nulle.';
    //   } else if (p.result === 'draw') {
    //     message = 'Match nul.';
    //   } else if (p.result === 'resigned') {
    //     message = 'Votre adversaire a abandonné la partie.';
    //   }

    //   Alert.alert('Partie terminée', message);
    //   console.log('Partie terminée', message);

    //   setTimeout(() => {
    //     router.replace('/main');
    //     dispatch(resetGame());
    //   }, 3000);
    // });

    socket.on('suggestionReceived', (p: any) => {
      if (!mounted) return;
      console.log('📥 📥✅ suggestionReceived:', JSON.stringify(p, null, 2));
      const raw = p.suggestions || {};
      const moves = raw.suggestions || [];
      const reasons = raw.explanations || [];
      const suggestions = moves.map((m: string, i: number) => ({
        move: m,
        reason: reasons[i] ?? 'Suggestion IA',
      }));
      dispatch(setSuggestions(suggestions));
      dispatch(setLoading(false));
    });

    // La fonction de nettoyage se déclenche au démontage du composant
    return () => {
      mounted = false;
      socket.off('joined');
      socket.off('gameOver');
      socket.off('suggestionReceived');
    };
  }, [socket, dispatch, router, updateFromGameObject, setSuggestions, resetGame]);

  // ✅ DEUXIÈME useEffect : Gère les événements qui dépendent de l'état du jeu.
  // Ce hook est relancé à chaque changement de `fen` ou `currentId`.
  useEffect(() => {
    if (!currentId || !socket) return;
    let mounted = true;

    socket.emit('joinGame', { gameId: currentId });

    socket.on('movePlayed', (payload: any) => {
      if (!mounted) return;
      const receivedFen = payload.game.fen;
      const currentFenInStore = fen;
      const chessReceived = new Chess(receivedFen);
      const chessCurrent = new Chess(currentFenInStore);
      if (chessReceived.history().length > chessCurrent.history().length) {
        dispatch(updateFromGameObject(payload.game));
        if (payload.move) {
          dispatch(appendMove(payload.move));
        }
      } else {
        console.log('⚠️ movePlayed ignoré car FEN obsolète ou identique.');
      }
    });

    socket.on('yourTurn', (p: any) => {
      if (!mounted) return;
      if (p?.game?.fen !== fen) {
        if (p?.game) {
          dispatch(updateFromGameObject(p.game));
          if (p.lastMove) {
            dispatch(appendMove(p.lastMove));
          }
        }
      }
    });

    return () => {
      mounted = false;
      socket.off('movePlayed');
      socket.off('yourTurn');
    };
  }, [socket, currentId, fen, dispatch, updateFromGameObject, appendMove]);

  // ✅ TROISIÈME useEffect : Gère la redirection si `currentId` n'existe pas.
  useEffect(() => {
    if (!currentId) {
      router.replace('/main');
    }
  }, [currentId, router]);

  async function onMove(from: string, to: string) {
    console.log(`called from onMove with ${from} to ${to}, mode:${mode}`);
    if (!currentId) return;
    try {
      dispatch(setLoading(true));
      socket.emit('makeMove', { gameId: currentId, move: `${from}${to}` });
    } catch (e: any) {
      Alert.alert('Coup invalide', e?.response?.data?.message || 'Cant play this move');
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleResign() {
    if (!currentId) return;
    try {
      console.log('Partie handleResign 🚫 🚫⚠️  ');
      dispatch(setLoading(true));
      socket.emit('resign', { gameId: currentId });
      Alert.alert('Abandon', 'You have abandoned the game.');
    } catch (e: any) {
      console.error('Abort error:', e);
      Alert.alert('Error', e?.message || 'Impossible to give up the game.');
    } finally {
      dispatch(setLoading(false));
      setShowConfirm(false);
    }
  }

  async function askSuggestion() {
    if (!assistantEnabled || !currentId) return;
    try {
      dispatch(setLoading(true));
      console.log('demande sugestion');
      socket.emit('getSuggestion', { gameId: currentId });
    } catch (e) {
      console.error('Error requesting suggestion:', e);
      dispatch(setLoading(false));
    }
  }

  // Quand `fen` change dans Redux → synchro du board
  useEffect(() => {
    if (!fen || !boardRef.current) return;
    console.log('🔄 useEffect fen déclenché', { fen, prevFen: prevFenRef.current });
    const prevFen = prevFenRef.current;
    if (!prevFen) {
      console.log('⚡ Premier affichage → reset complet');
      boardRef.current.resetBoard(fen);
      prevFenRef.current = fen;
      return;
    }
    if (prevFen === fen) {
      console.log('ℹ️ FEN inchangé → rien à faire');
      return;
    }
    const lastMove = extractLastMove(prevFen, fen);
    if (lastMove) {
      console.log('✅ Dernier coup extrait et appliqué:', lastMove);
      boardRef.current.move({ from: lastMove.from, to: lastMove.to });
    } else {
      console.warn('⚠️ Impossible de trouver le dernier coup → reset complet');
      boardRef.current.resetBoard(fen);
    }
    prevFenRef.current = fen;
    console.log('🔄 prevFenRef mis à jour:', prevFenRef.current);
  }, [fen]);

  // Fonctions de fin de partie
  const handleNewGame = () => {
    setGameEndData({ visible: false, result: '', isWinner: false });
    // Logique pour démarrer une nouvelle partie
    router.replace('/main');
    dispatch(resetGame());
  };

  const handleRematch = () => {
    setGameEndData({ visible: false, result: '', isWinner: false });
    // Logique pour une revanche
    router.replace('/main');
    dispatch(resetGame());
  };

  const handleMainMenu = () => {
    setGameEndData({ visible: false, result: '', isWinner: false });
    dispatch(resetGame());
    router.replace('/main');
    dispatch(resetGame());
  };

  const handleAnalyze = () => {
    // Fonctionnalité future
    console.log('Analyse de la partie à implémenter');
    dispatch(resetGame());
  };

  if (!playerColor) {
    return <WaitingForOpponent />;
  }

  const boardColor = {
    black: '#481f01',
    white: '#eeeed2',
    lastMoveHighlight: 'rgba(255, 255, 0, 0.5)',
    checkmateHighlight: '#E84855',
    promotionPieceButton: '#FF9B71',
  };

  return (
    <ImageBackground source={lobby} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <View style={styles.boardContainer}>
          <Chessboard
            ref={boardRef}
            onMove={async (info: any) => {
              console.log(`info: ${JSON.stringify(info)}`);
              const pieceColor = info.move.color;
              if (pieceColor !== playerColor) {
                console.log('⛔ Not your color !');
                setTimeout(() => {
                  boardRef.current?.resetBoard(fen);
                }, 50);
                return false;
              }
              if (turn !== playerColor) {
                console.log('⛔ Not your turn!');
                setTimeout(() => {
                  boardRef.current?.resetBoard(fen);
                }, 50);
                return false;
              }
              try {
                await onMove(info.move.from, info.move.to);
                return false;
              } catch (e) {
                console.error('Error backend:', e);
                setTimeout(() => {
                  boardRef.current?.resetBoard(fen);
                }, 50);
                return false;
              }
            }}
            colors={boardColor}
          />
        </View>

        {/* Controls are now OUTSIDE boardContainer -> docked at bottom */}
        <View style={styles.controls}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowConfirm(true)}
            style={styles.button}
          >
            <FlagIcon size={28} color="#FF6B6B" />
            <Text style={styles.buttonText}>Resign</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowMoves(true)} style={styles.button}>
            <BookOpenIcon size={28} color="#FFF" />
            <Text style={styles.buttonText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowCoach(true)} style={styles.button}>
            <LightbulbIcon size={28} color="#FFF" />
            <Text style={styles.buttonText}>Hint</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/main')} style={styles.button}>
            <DoorOpenIcon size={28} color="#FFF" />
            <Text style={styles.buttonText}>Exit</Text>
          </TouchableOpacity>
        </View>

        {/* Modals */}
        <ImprovedModal visible={showMoves} onClose={() => setShowMoves(false)} title="Move History">
          <MoveList moves={moves} fullWidth />
        </ImprovedModal>
        <ImprovedModal visible={showCoach} onClose={() => setShowCoach(false)} title="Coach IA">
          <AssistantPanel onAsk={askSuggestion} fullWidth />
        </ImprovedModal>

        {/* Modal Confirmation Abandon */}
        {/* Modal Confirmation Abandon */}
        <ImprovedModal
          visible={showConfirm}
          onClose={() => setShowConfirm(false)}
          title="Give up the game?"
        >
          <View style={{ gap: 20 }}>
            <Text style={styles.confirmText}>Are you sure you want to give up the game?</Text>
            <View style={styles.confirmButtonRow}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.resignButton]}
                onPress={handleResign}
              >
                <Text style={styles.confirmButtonText}>Resig</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImprovedModal>

        {/* Modal de fin de partie */}
        <GameEndModal
          visible={gameEndData.visible}
          result={gameEndData.result}
          isWinner={gameEndData.isWinner}
          onNewGame={handleNewGame}
          onRematch={handleRematch}
          onMainMenu={handleMainMenu}
          onAnalyze={handleAnalyze}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: '100%',
    paddingVertical: 40, // same as PlayLocal
    alignItems: 'center',
  },

  boardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#8B4513',
    borderWidth: 2,
    borderColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 8,
    zIndex: 10,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  waitingTitle: {
    fontFamily: 'CinzelDecorative-Bold',
    fontSize: 28,
    color: '#FFF8E1',
    textAlign: 'center',
    marginBottom: 20,
  },
  waitingText: {
    color: '#E0E0E0',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
  },
  spinner: {
    marginVertical: 20,
  },
  waitingDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4AF37',
  },
  // Styles pour les modales améliorées
  improvedModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalBackdrop: {
    flex: 1,
  },
  improvedModalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E1E2D',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.85,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalHeaderTitle: {
    fontFamily: 'CinzelDecorative-Bold',
    fontSize: 20,
    color: '#FFF8E1',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  // Styles pour la modal de confirmation
  // modalOverlay: {
  //   flex: 1,
  //   backgroundColor: 'rgba(0,0,0,0.8)',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // confirmModal: {
  //   width: width * 0.85,
  //   maxWidth: 400,
  //   backgroundColor: '#1E1E2D',
  //   borderRadius: 15,
  //   padding: 25,
  //   alignItems: 'center',
  //   borderWidth: 2,
  //   borderColor: '#D4AF37',
  //   elevation: 20,
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 8 }, // Ombre plus marquée
  //   shadowOpacity: 0.5,
  //   shadowRadius: 10,
  //   // Ajout de propriétés pour assurer la visibilité
  //   zIndex: 1000,
  // },
  confirmModal: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5, // Android shadow
  },

  confirmTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF8E1',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'CinzelDecorative-Bold',
  },
  confirmText: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  confirmButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 15,
  },
  confirmButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cancelButton: {
    backgroundColor: '#6B7280',
    borderWidth: 1,
    borderColor: '#9CA3AF',
  },
  resignButton: {
    // Nouveau style pour le bouton d'abandon
    backgroundColor: '#DC2626',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  confirmButtonText: {
    color: '#FFF8E1',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#FFF8E1',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Styles pour la modal de fin de partie
  gameEndOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameEndModal: {
    width: '90%',
    backgroundColor: '#1E1E2D',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  gameEndHeader: {
    padding: 25,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  gameEndIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  gameEndTitle: {
    fontFamily: 'CinzelDecorative-Bold',
    fontSize: 28,
    color: '#FFF8E1',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  gameEndContent: {
    padding: 25,
  },
  gameEndSubtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  gameEndButtons: {
    gap: 15,
  },
  gameEndButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D4AF37',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  gameEndButtonText: {
    color: '#FFF8E1',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  analyzeButton: {
    backgroundColor: '#4A5568',
    borderColor: '#9CA3AF',
  },
  menuButton: {
    backgroundColor: '#2D3748',
    borderColor: '#718096',
  },
  // Styles pour les confettis
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginBottom: 5,
  },
  button: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
});
