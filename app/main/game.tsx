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
  markEvent,
  resetGame,
  resignGame,
  // setGameSnapshot,
  setLoading,
  setSuggestions,
  updateFromGameObject,
} from '../../store/gameSlice';;

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

    // Le `joinGame` est maintenant sécurisé par le `useEffect` du hook `useSocket`.
    // On l'appelle ici pour se lier à une partie une fois le screen monté.
    socket.emit('joinGame', { gameId: currentId });

    socket.on('joined', (p: any) => {
      if (!mounted) return;
      console.log('📥 joined reçu:', JSON.stringify(p, null, 2));
    });

    // Ajout d'une variable de nettoyage pour éviter les mises à jour sur un composant non monté

    // Correction 2: Utilisation de `updateFromGameObject` pour toute mise à jour venant de la socket
    // Dans `game.tsx`
    socket.on('movePlayed', (payload: any) => {
      console.log('📥 movePlayed reçu:', JSON.stringify(payload, null, 2));
      if (!mounted) return;

      // Récupérer le FEN de la confirmation et l'état actuel du store
      const receivedFen = payload.game.fen;
      const currentFenInStore = fen; // `fen` est déjà dans le scope de l'useEffect

      // Si le FEN reçu correspond au FEN actuel ou s'il est un coup précédent, on l'ignore.
      // La logique la plus simple est d'utiliser `chess.js` pour comparer les FEN complets.
      // Ici, on peut se baser sur le tour de jeu pour s'assurer que le FEN n'est pas obsolète.
      const chessReceived = new Chess(receivedFen);
      const chessCurrent = new Chess(currentFenInStore);

      // On compare le nombre total de coups joués.
      if (chessReceived.history().length > chessCurrent.history().length) {
        // Si le FEN de l'événement est plus avancé que le FEN actuel du store
        dispatch(updateFromGameObject(payload.game));
      } else {
        console.log('⚠️ movePlayed ignoré car FEN obsolète ou identique.');
      }
    });

    // Dans `game.tsx`
    socket.on('yourTurn', (p: any) => {
      console.log('📥📥📥 yourTurn reçu:', JSON.stringify(p, null, 2));
      if (!mounted) return;

      // On ne met à jour que si le FEN reçu est différent et que c'est un nouveau coup.
      // La comparaison du FEN est suffisante et gère déjà les cas de désynchronisation.
      if (p?.game?.fen !== fen) {
        if (p?.game) {
          dispatch(updateFromGameObject(p.game));
          if (p.lastMove) {
            dispatch(appendMove(p.lastMove));
          }
          console.log('✅ yourTurn: FEN mis à jour après coup de l’IA');
        }
      }
    });

    socket.on('playerResigned', (p: any) => {
      console.log('📥 abandon reçu:', JSON.stringify(p, null, 2));
      dispatch(markEvent('resigned'));
      dispatch(resetGame());
      Alert.alert('Abandon', p.message || 'Un joueur a abandonné la partie.');
      router.replace('/main');
    });

    socket.on('gameOver', (p: any) => {
      if (!mounted) return;
      if (p?.game) dispatch(updateFromGameObject(p.game));
      Alert.alert('Partie terminée', p.result || 'Fin');
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
      dispatch(setLoading(false)); // ✅ désactive le loading après réception
    });

    return () => {
      mounted = false;
      socket.off('movePlayed');
      socket.off('yourTurn');
      socket.off('playerResigned');
      socket.off('gameOver');
      socket.off('suggestionReceived');
    };
  }, [socket, currentId, dispatch, updateFromGameObject, appendMove, setSuggestions]); // Correction 3: Ajout des dépendances manquantes
  console.log(`socket${socket} , currentId:${currentId},  `);

  async function onMove(from: string, to: string) {
    console.log(`called from onMove with ${from} to ${to}, mode:${mode}`);
    if (!currentId) return;
    try {
      dispatch(setLoading(true));
      // En ligne: tout passe par la socket
      socket.emit('makeMove', { gameId: currentId, move: `${from}${to}` });
    } catch (e: any) {
      Alert.alert('Coup invalide', e?.response?.data?.message || 'Cant play this move');
    } finally {
      dispatch(setLoading(false));
    }
  }

  //new
   async function handleResign() {
    if (!currentId) return;
    try {
      dispatch(setLoading(true));

      //  Mise à jour côté backend via API
      await dispatch(resignGame(currentId)).unwrap();

      //  Notification temps réel via socket
      socket.emit('resign', { gameId: currentId });

      //  Feedback utilisateur
      Alert.alert('Abandon', 'You have abandoned the game.');

      //  Retour à la liste des parties
      router.replace('/main');
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
      dispatch(setLoading(false)); // 🚫 désactive si erreur
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

    // Mettre à jour prevFenRef uniquement après avoir appliqué le coup
    prevFenRef.current = fen;
    console.log('🔄 prevFenRef mis à jour:', prevFenRef.current);
  }, [fen]);

  useEffect(() => {
    if (!currentId) {
      router.replace('/main');
    }
  }, [currentId]);

  if (!playerColor) {
    return <Text>Loading game...</Text>;
  }


  return (
    <ImageBackground source={lobby} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        {/* <GameHeader status={status} turn={turn} /> */}
        <View style={styles.boardContainer}>
          <Chessboard
            ref={boardRef}
          // fen={fen || undefined}
          onMove={async (info: any) => {
            console.log(`info: ${JSON.stringify(info)}`);
            const pieceColor = info.move.color; // ✅ "w" ou "b"

            // 1️⃣ Vérifie que le joueur bouge bien une pièce de sa couleur
            if (pieceColor !== playerColor) {
              console.log('⛔ Not your color !');
              setTimeout(() => {
                boardRef.current?.resetBoard(fen);
              }, 50);
              return false;
            }

            // 2️⃣ Vérifie que c'est bien son tour
            if (turn !== playerColor) {
              console.log('⛔ Not your turn!');
              setTimeout(() => {
                boardRef.current?.resetBoard(fen);
              }, 50);
              return false;
            }

            try {
              // 3️⃣ Envoi du coup au backend
              await onMove(info.move.from, info.move.to);

              // ⚠️ L'UI ne bouge pas tout de suite → on attend le FEN du backend
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
            <AssistantPanel onAsk={askSuggestion} fullWidth />
            <Pressable
              onPress={() => setShowCoach(false)}
              style={{ padding: 16, alignSelf: 'center' }}
            >
              <Text style={{ color: '#2563eb' }}>close</Text>
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
                  <Text>cancel</Text>
                </Pressable>
                <Pressable onPress={handleResign}>
                  <Text>Yes, give up</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
