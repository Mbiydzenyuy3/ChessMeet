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
  askSuggestions,
  playMoveVsAI,
  resignGame,
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

  const { currentId, fen, moves, assistantEnabled, mode } = useAppSelector((s) => s.game);

  const chess = useMemo(() => newChess(fen), [fen]);
  const turn = useMemo(() => chess.turn(), [chess]);
  // const status = useMemo(() => {
  //   if (chess.isGameOver()) return 'Partie terminée';
  //   if (chess.isCheckmate()) return 'Échec et mat';
  //   return 'active';
  // }, [chess]);

  const [showMoves, setShowMoves] = useState(false);
  const [showCoach, setShowCoach] = useState(false);

  useEffect(() => {
    if (!currentId) return;
    let mounted = true;
    socket.emit('joinGame', { gameId: currentId });
    socket.on('movePlayed', (payload: any) => {
      if (!mounted) return;
      dispatch(updateFromGameObject(payload.game));
      dispatch(appendMove(payload.move));
    });
    socket.on('yourTurn', (p: any) => {
      if (!mounted) return;
      if (p?.game) dispatch(updateFromGameObject(p.game));
    });
    socket.on('playerResigned', (p: any) => {
      if (!mounted) return;
      Alert.alert('Abandon', p.message);
    });
    socket.on('gameOver', (p: any) => {
      if (!mounted) return;
      if (p?.game) dispatch(updateFromGameObject(p.game));
      Alert.alert('Partie terminée', p.result || 'Fin');
    });
    socket.on('suggestionReceived', (p: any) => {
      if (!mounted) return;
      dispatch(setSuggestions(p.suggestions || []));
    });
    return () => {
      mounted = false;
      socket.off('movePlayed');
      socket.off('yourTurn');
      socket.off('playerResigned');
      socket.off('gameOver');
      socket.off('suggestionReceived');
    };
  }, [socket, currentId, dispatch, updateFromGameObject, appendMove, setSuggestions]);

  async function onMove(from: string, to: string) {
    if (!currentId) return;
    try {
      dispatch(setLoading(true));
      if (mode === 'online') {
        socket.emit('playMove', { gameId: currentId, move: `${from}${to}` });
      } else {
        await dispatch(playMoveVsAI({ gameId: currentId, from, to })).unwrap();
      }
    } catch (e: any) {
      Alert.alert('Coup invalide', e?.response?.data?.message || 'Cant play this move');
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleResign() {
    if (!currentId) return;
    try {
      await dispatch(resignGame(currentId)).unwrap();
      Alert.alert('Game Abandoned', 'You have abandoned the game.');
    } catch (_e: any) {
      Alert.alert('Erreur', _e?.response?.data?.message || "Can't give up the game");
    }
  }

  async function askSuggestion() {
    if (!assistantEnabled || !currentId) return;
    if (mode === 'ai') {
      await dispatch(askSuggestions({ gameId: currentId })).unwrap();
    } else {
      socket.emit('getSuggestion', { gameId: currentId });
    }
  }

  useEffect(() => {
    if (fen && boardRef.current) {
      boardRef.current?.resetBoard(fen);
    }
  }, [fen]);

  useEffect(() => {
    if (!currentId) {
      router.replace('/main');
    }
  }, [currentId]);

  return (
    <ImageBackground source={lobby} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        {/* <GameHeader status={status} turn={turn} /> */}
        <View style={styles.boardContainer}>
          <Chessboard
            ref={boardRef}
            fen={fen || undefined}
            onMove={async (info: any) => {
              const pieceColor = info.move.color;
              if (pieceColor !== playerColor || turn !== playerColor) {
                setTimeout(() => boardRef.current?.resetBoard(fen), 50);
                return false;
              }
              try {
                await onMove(info.move.from, info.move.to);
                return false;
              } catch (_e: any) {
                setTimeout(() => boardRef.current?.resetBoard(fen), 50);
                Alert.alert('move invalid', _e?.response?.data?.message || 'Cant play this move');

                return false;
              }
            }}
            colors={{
              black: '#779952',
              white: '#edeed1',
            }}
          />

          <View style={styles.buttonRow}>
            <Pressable onPress={handleResign} style={styles.actionButton}>
              <Text style={styles.buttonText}>Give up</Text>
            </Pressable>
            <Pressable onPress={() => setShowMoves(true)} style={styles.actionButton}>
              <Text style={styles.buttonText}>History</Text>
            </Pressable>
            <Pressable onPress={() => setShowCoach(true)} style={styles.actionButton}>
              <Text style={styles.buttonText}>AI Coach</Text>
            </Pressable>
          </View>

          {/* Modal Historique */}
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

          {/* Modal Coach IA */}
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
    backgroundColor: '#1E1E2D', // Dark background for modals
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
