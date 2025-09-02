// /* eslint-disable react-native/no-color-literals */
// /* eslint-disable react-native/no-inline-styles */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// // ============================ app/(main)/game.tsx (Corrigé) ============================
// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { View, Text, Alert, Pressable, Modal } from 'react-native';
// import GameHeader from '../../components/GameHeader';
// import MoveList from '../../components/MoveList';
// import AssistantPanel from '../../components/AssistantPanel';
// import { useAppDispatch, useAppSelector } from '../../store';
// import { Chess } from 'chess.js';

// import {
//   appendMove,
//   // setGameSnapshot,
//   setLoading,
//   setSuggestions,
//   playMoveVsAI,
//   updateFromGameObject,
//   resignGame,
//   askSuggestions, // Import du thunk d'abandon
// } from '../../store/gameSlice';
// import { newChess } from '../../lib/chess';
// import { useSocket } from '../../hooks/useSocket';
// import Chessboard, { ChessboardRef } from 'react-native-chessboard';
// import { useRouter } from 'expo-router';

// /**
//  * Compare deux FEN et retourne le dernier coup joué { from, to, san }.
//  * @param prevFen - FEN avant le coup
//  * @param newFen - FEN après le coup
//  */
// export function extractLastMove(prevFen: string, newFen: string) {
//   const chessPrev = new Chess(prevFen);
//   const chessNew = new Chess(newFen);
//   console.log(`appele de la fonction extractLastMove`);

//   // Liste des coups légaux depuis l'état précédent
//   const legalMoves = chessPrev.moves({ verbose: true });

//   // On rejoue chaque coup pour voir lequel mène au newFen
//   for (const move of legalMoves) {
//     const clone = new Chess(prevFen);
//     clone.move({ from: move.from, to: move.to, promotion: move.promotion });

//     if (clone.fen() === newFen) {
//       return {
//         from: move.from,
//         to: move.to,
//         san: move.san, // notation algébrique standard (ex: "Nf3")
//       };
//     }
//   }

//   // fallback : si aucun match (rare, problème de synchro)
//   const history = chessNew.history({ verbose: true });
//   const last = history[history.length - 1];
//   if (last) {
//     return {
//       from: last.from,
//       to: last.to,
//       san: last.san,
//     };
//   }

//   return null;
// }

// export function usePlayerColor(): 'w' | 'b' | null {
//   const user = useAppSelector((state) => state.auth.user);
//   const { whitePlayer, blackPlayer } = useAppSelector((s) => s.game);

//   if (!user?._id) return null;

//   if (whitePlayer && String(whitePlayer) === String(user._id)) return 'w';
//   if (blackPlayer && String(blackPlayer) === String(user._id)) return 'b';

//   return null; // spectateur ou erreur
// }
// export default function GameScreen() {
//   const router = useRouter();

//   const dispatch = useAppDispatch();
//   const socket = useSocket();
//   const boardRef = useRef<ChessboardRef>(null);
//   const playerColor = usePlayerColor();
//   console.log(`couleur du joueru ${playerColor}`);
//   // const { width } = useWindowDimensions();
//   // const isNarrow = width < 768;

//   const { currentId, fen, moves, assistantEnabled, mode } = useAppSelector((s) => s.game);

//   // Correction 1: Le tour (turn) est maintenant déduit directement de l'état "fen"
//   const chess = useMemo(() => newChess(fen), [fen]);
//   const turn = useMemo(() => chess.turn(), [chess]);
//   const status = useMemo(() => {
//     // Une logique plus complète ici serait nécessaire
//     if (chess.isGameOver()) return 'Partie terminée';
//     if (chess.isCheckmate()) return 'Échec et mat';
//     return 'active';
//   }, [chess]);

//   // Modals (mobile)
//   const [showMoves, setShowMoves] = useState(false);
//   const [showCoach, setShowCoach] = useState(false);

//   useEffect(() => {
//     if (!currentId) return;

//     // Le `joinGame` est maintenant sécurisé par le `useEffect` du hook `useSocket`.
//     // On l'appelle ici pour se lier à une partie une fois le screen monté.
//     socket.emit('joinGame', { gameId: currentId });

//     // Ajout d'une variable de nettoyage pour éviter les mises à jour sur un composant non monté
//     let mounted = true;

//     // Correction 2: Utilisation de `updateFromGameObject` pour toute mise à jour venant de la socket
//     socket.on('movePlayed', (payload: any) => {
//       console.log('📥 movePlayed reçu:', JSON.stringify(payload, null, 2));

//       if (!mounted) return;
//       // On met à jour l'état Redux directement avec l'objet complet du jeu
//       dispatch(updateFromGameObject(payload.game));
//       dispatch(appendMove(payload.move)); // On append le coup à l'historique
//     });

//     socket.on('yourTurn', (p: any) => {
//       console.log('📥 yourTurn reçu:', JSON.stringify(p, null, 2));
//       if (!mounted) return;
//       if (p?.game) dispatch(updateFromGameObject(p.game));
//     });

//     socket.on('playerResigned', (p: any) => {
//       if (!mounted) return;
//       Alert.alert('Abandon', p.message);
//     });

//     socket.on('gameOver', (p: any) => {
//       if (!mounted) return;
//       if (p?.game) dispatch(updateFromGameObject(p.game));
//       Alert.alert('Partie terminée', p.result || 'Fin');
//     });

//     socket.on('suggestionReceived', (p: any) => {
//       if (!mounted) return;
//       dispatch(setSuggestions(p.suggestions || []));
//     });

//     return () => {
//       mounted = false;
//       socket.off('movePlayed');
//       socket.off('yourTurn');
//       socket.off('playerResigned');
//       socket.off('gameOver');
//       socket.off('suggestionReceived');
//     };
//   }, [socket, currentId, dispatch, updateFromGameObject, appendMove, setSuggestions]); // Correction 3: Ajout des dépendances manquantes
//   console.log(`socket${socket} , currentId:${currentId},  `);

//   async function onMove(from: string, to: string) {
//     console.log(`appele de onMove avec ${from} to ${to}, mode:${mode}`);
//     if (!currentId) return;
//     try {
//       dispatch(setLoading(true));
//       if (mode === 'online') {
//         // En ligne: tout passe par la socket
//         socket.emit('playMove', { gameId: currentId, move: `${from}${to}` });
//       } else {
//         // IA: POST (coup joueur) puis GET (coup IA)
//         await dispatch(playMoveVsAI({ gameId: currentId, from, to })).unwrap();
//       }
//     } catch (e: any) {
//       Alert.alert('Coup invalide', e?.response?.data?.message || 'Cant play this move');
//     } finally {
//       dispatch(setLoading(false));
//     }
//   }

//   async function handleResign() {
//     console.log('📤 handleResign appelé, gameId:', currentId);

//     if (!currentId) return;
//     try {
//       await dispatch(resignGame(currentId)).unwrap();
//       Alert.alert('Game Abandoned', 'You have abandoned the game.');
//     } catch (e: any) {
//       Alert.alert('Erreur', e?.response?.data?.message || "Can't give up the game");
//     }
//   }

//   async function askSuggestion() {
//     if (!assistantEnabled || !currentId) return;
//     if (mode === 'ai') {
//       // ✅ IA → on dispatch le thunk Redux
//       await dispatch(askSuggestions({ gameId: currentId })).unwrap();
//     } else {
//       // ✅ Online → socket classique
//       socket.emit('getSuggestion', { gameId: currentId });
//     }
//   }

//   // Quand `fen` change dans Redux → synchro du board
//   useEffect(() => {
//     if (fen && boardRef.current) {
//       boardRef.current?.resetBoard(fen);
//     }
//   }, [fen]);
//   useEffect(() => {
//     if (!currentId) {
//       router.replace('/main');
//     }
//   }, [currentId]);

//   // if (lastEvent === 'resigned') {
//   //   return (
//   //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//   //       <Text style={{ fontSize: 18, color: 'red' }}>The game is over (surrender)</Text>
//   //       <Button title="Retour au Lobby" onPress={() => router.replace('/main')} />
//   //     </View>
//   //   );
//   // }

//   return (
//     <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
//       <GameHeader status={status} turn={turn} />
//       {/* <View style={{ flex: 1, flexDirection: 'row' }}>
//         <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 12 }}>
//           <Chessboard
//             fen={fen || undefined}
//             boardSize={Math.min(screenW - 320, 420)}
//             onMove={(info: any) => {
//               const last = extractLastMove(fen, info.fen);
//               if (last) {
//                 onMove(last.from, last.to); // ta logique Redux (coup vs IA ou socket)
//               }
//             }}
//             gestureEnabled
//             durations={{ move: 150 }}
//           />

//           <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
//             <Pressable
//               onPress={handleResign} // Correction 4: Utilisation d'une fonction dédiée
//               style={{ padding: 10, borderRadius: 10, backgroundColor: '#fee2e2' }}
//             >
//               <Text style={{ color: '#991b1b' }}>Abandonner</Text>
//             </Pressable>
//             <Pressable
//               onPress={askSuggestion}
//               style={{ padding: 10, borderRadius: 10, backgroundColor: '#e0e7ff' }}
//             >
//               <Text style={{ color: '#1e3a8a' }}>Conseil IA</Text>
//             </Pressable>
//           </View>
//         </View>
//         <MoveList moves={moves} />
//         <AssistantPanel onAsk={askSuggestion} />
//       </View> */}

//       <View style={{ flex: 1, alignItems: 'center', padding: 12 }}>
//         <Chessboard
//           ref={boardRef}
//           fen={fen || undefined}
//           onMove={async (info: any) => {
//             console.log(`info: ${JSON.stringify(info)}`);
//             const pieceColor = info.move.color; // ✅ "w" ou "b"

//             // 1️⃣ Vérifie que le joueur bouge bien une pièce de sa couleur
//             if (pieceColor !== playerColor) {
//               console.log('⛔ Pas ta couleur !');
//               setTimeout(() => {
//                 boardRef.current?.resetBoard(fen);
//               }, 50);
//               return false;
//             }

//             // 2️⃣ Vérifie que c'est bien son tour
//             if (turn !== playerColor) {
//               console.log('⛔ Pas ton tour !');
//               setTimeout(() => {
//                 boardRef.current?.resetBoard(fen);
//               }, 50);
//               return false;
//             }

//             try {
//               // 3️⃣ Envoi du coup au backend
//               await onMove(info.move.from, info.move.to);

//               // ⚠️ L'UI ne bouge pas tout de suite → on attend le FEN du backend
//               return false;
//             } catch (e) {
//               console.error('Erreur backend:', e);
//               setTimeout(() => {
//                 boardRef.current?.resetBoard(fen);
//               }, 50);
//               return false;
//             }
//           }}
//         />

//         <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
//           <Pressable
//             onPress={() => {
//               console.log('🔥 Pressable cliqué');
//               handleResign();
//             }}
//             style={{ padding: 10, borderRadius: 10, backgroundColor: '#fee2e2' }}
//           >
//             <Text style={{ color: '#991b1b' }}>Give up</Text>
//           </Pressable>
//           <Pressable
//             onPress={() => setShowMoves(true)}
//             style={{
//               padding: 10,
//               borderRadius: 10,
//               backgroundColor: 'white',
//               borderWidth: 1,
//               borderColor: '#e5e7eb',
//             }}
//           >
//             <Text>Historique</Text>
//           </Pressable>
//           <Pressable
//             onPress={() => setShowCoach(true)}
//             style={{ padding: 10, borderRadius: 10, backgroundColor: '#e0e7ff' }}
//           >
//             <Text style={{ color: '#1e3a8a' }}>Coach IA</Text>
//           </Pressable>
//         </View>

//         {/* Modal Historique */}
//         <Modal visible={showMoves} animationType="slide" onRequestClose={() => setShowMoves(false)}>
//           <View style={{ flex: 1, paddingTop: 48, backgroundColor: 'white' }}>
//             <View
//               style={{
//                 paddingHorizontal: 16,
//                 paddingBottom: 8,
//                 borderBottomWidth: 1,
//                 borderColor: '#e5e7eb',
//               }}
//             >
//               <Text style={{ fontSize: 18, fontWeight: '700' }}>story</Text>
//             </View>
//             <MoveList moves={moves} fullWidth />
//             <Pressable
//               onPress={() => setShowMoves(false)}
//               style={{ padding: 16, alignSelf: 'center' }}
//             >
//               <Text style={{ color: '#2563eb' }}>close</Text>
//             </Pressable>
//           </View>
//         </Modal>

//         {/* Modal Coach IA */}
//         <Modal visible={showCoach} animationType="slide" onRequestClose={() => setShowCoach(false)}>
//           <View style={{ flex: 1, paddingTop: 48, backgroundColor: 'white' }}>
//             <View
//               style={{
//                 paddingHorizontal: 16,
//                 paddingBottom: 8,
//                 borderBottomWidth: 1,
//                 borderColor: '#e5e7eb',
//               }}
//             >
//               <Text style={{ fontSize: 18, fontWeight: '700' }}>Coach IA</Text>
//             </View>
//             <AssistantPanel onAsk={askSuggestion} fullWidth />
//             <Pressable
//               onPress={() => setShowCoach(false)}
//               style={{ padding: 16, alignSelf: 'center' }}
//             >
//               <Text style={{ color: '#2563eb' }}>close</Text>
//             </Pressable>
//           </View>
//         </Modal>
//       </View>
//     </View>
//   );
// }

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
