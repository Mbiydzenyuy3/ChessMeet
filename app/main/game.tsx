/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Chess } from 'chess.js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ImageBackground, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
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
  // setGameSnapshot,
  setLoading,
  setSuggestions,
  updateFromGameObject,
} from '../../store/gameSlice';

import lobby from '../../assets/images/woodenbg.jpg'; // Import the background

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

export default function GameScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const socket = useSocket();
  const boardRef = useRef<ChessboardRef>(null);
  const playerColor = usePlayerColor();
  const prevFenRef = useRef<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  console.log(`couleur du joueru ${playerColor}`);

  const { currentId, fen, moves, assistantEnabled, mode } = useAppSelector((s) => s.game);

  // Le tour (turn) est maintenant déduit directement de l'état "fen"

  const chess = useMemo(() => newChess(fen), [fen]);
  const turn = useMemo(() => chess.turn(), [chess]);

  const [showMoves, setShowMoves] = useState(false);
  const [showCoach, setShowCoach] = useState(false);

  const user = useAppSelector((state) => state.auth.user);

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
      console.log('📥 gameOver ⚠️ reçu:', JSON.stringify(p, null, 2));

      // L'ID utilisateur doit être récupéré de l'état global ou passé en paramètre
      const userId = user?._id;

      // if (p?.game) dispatch(updateFromGameObject(p.game));

      let message = 'La partie est terminée.';
      if (p.result === 'checkmate') {
        if (p.winnerId === userId) {
          message = 'Félicitations, vous avez gagné par échec et mat !';
        } else {
          message = 'Échec et mat ! Vous avez perdu.';
        }
      } else if (p.result === 'stalemate') {
        message = 'Pat ! La partie est nulle.';
      } else if (p.result === 'draw') {
        message = 'Match nul.';
      } else if (p.result === 'resigned') {
        message = 'Votre adversaire a abandonné la partie.';
      }

      Alert.alert('Partie terminée', message);
      console.log('Partie terminée', message);

      setTimeout(() => {
        router.replace('/main');
        dispatch(resetGame());
      }, 3000);
    });

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

  if (!playerColor) {
    return <Text>Loading game...</Text>;
  }

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
            colors={{
              black: '#779952',
              white: '#edeed1',
            }}
          />
          <View style={styles.buttonRow}>
            <Pressable onPress={() => setShowConfirm(true)} style={styles.actionButton}>
              <Text style={styles.buttonText}>Give up</Text>
            </Pressable>
            <Pressable onPress={() => setShowMoves(true)} style={styles.actionButton}>
              <Text style={styles.buttonText}>History</Text>
            </Pressable>
            <Pressable onPress={() => setShowCoach(true)} style={styles.actionButton}>
              <Text style={styles.buttonText}>AI Coach</Text>
            </Pressable>
          </View>
          <Modal
            visible={showMoves}
            animationType="slide"
            onRequestClose={() => setShowMoves(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Move History</Text>
              <MoveList moves={moves} fullWidth />
              <Pressable onPress={() => setShowMoves(false)} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseText}>Close</Text>
              </Pressable>
            </View>
          </Modal>
          <Modal
            visible={showCoach}
            animationType="slide"
            onRequestClose={() => setShowCoach(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>AI Coach</Text>
              <AssistantPanel onAsk={askSuggestion} fullWidth />
              <Pressable onPress={() => setShowCoach(false)} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseText}>Close</Text>
              </Pressable>
            </View>
          </Modal>
          <Modal visible={showConfirm} transparent animationType="fade">
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}
            >
              <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12 }}>
                <Text>Give up the game?</Text>
                <View style={{ flexDirection: 'row', marginTop: 12 }}>
                  <Pressable onPress={() => setShowConfirm(false)}>
                    <Text>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={handleResign}>
                    <Text>Yes, give up</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </View>
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
  },
  boardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 100,
  },
  actionButton: {
    backgroundColor: '#8B4513',
    borderWidth: 2,
    borderColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF8E1',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContent: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#1E1E2D',
  },
  modalTitle: {
    fontFamily: 'CinzelDecorative-Bold',
    fontSize: 24,
    color: '#FFF8E1',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalCloseButton: {
    padding: 16,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 20,
  },
  modalCloseText: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
