// /* eslint-disable react-native/no-color-literals */
// /* eslint-disable react-native/no-inline-styles */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { Chess } from 'chess.js';
// import { ArrowLeft } from 'lucide-react-native';
// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   ImageBackground,
//   Modal,
//   Pressable,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   Dimensions,
// } from 'react-native';
// import Animated, {
//   useAnimatedStyle,
//   useSharedValue,
//   withTiming,
//   withSequence,
//   withRepeat,
//   withDelay,
//   interpolate,
//   Extrapolation,
// } from 'react-native-reanimated';

// import AssistantPanel from '../../components/AssistantPanel';
// import MoveList from '../../components/MoveList';
// import { useAppDispatch, useAppSelector } from '../../store';

// import { useRouter } from 'expo-router';
// import Chessboard, { ChessboardRef } from 'react-native-chessboard';
// import { useSocket } from '../../hooks/useSocket';
// import { newChess } from '../../lib/chess';
// import {
//   appendMove,
//   resetGame,
//   setLoading,
//   setSuggestions,
//   updateFromGameObject,
// } from '../../store/gameSlice';

// import lobby from '../../assets/images/woodenbg.jpg';

// const { width, height } = Dimensions.get('window');
// const AnimatedView = Animated.createAnimatedComponent(View);
// const AnimatedText = Animated.createAnimatedComponent(Text);

// // Helper functions remain unchanged
// export function extractLastMove(prevFen: string, newFen: string) {
//   const chessPrev = new Chess(prevFen);
//   const chessNew = new Chess(newFen);

//   const legalMoves = chessPrev.moves({ verbose: true });
//   for (const move of legalMoves) {
//     const clone = new Chess(prevFen);
//     clone.move({ from: move.from, to: move.to, promotion: move.promotion });
//     if (clone.fen() === newFen) {
//       return { from: move.from, to: move.to, san: move.san };
//     }
//   }
//   const history = chessNew.history({ verbose: true });
//   const last = history[history.length - 1];
//   if (last) {
//     return { from: last.from, to: last.to, san: last.san };
//   }
//   return null;
// }

// export function usePlayerColor(): 'w' | 'b' | null {
//   const user = useAppSelector((state) => state.auth.user);
//   const { whitePlayer, blackPlayer } = useAppSelector((s) => s.game);
//   if (!user?._id) return null;
//   if (whitePlayer && String(whitePlayer) === String(user._id)) return 'w';
//   if (blackPlayer && String(blackPlayer) === String(user._id)) return 'b';
//   return null;
// }

// // Composant pour les confettis animés
// const ConfettiPiece = ({ index }: { index: number }) => {
//   const translateY = useSharedValue(-height);
//   const translateX = useSharedValue(0);
//   const rotation = useSharedValue(0);

//   useEffect(() => {
//     translateY.value = withDelay(
//       index * 50,
//       withTiming(height + 100, { duration: 3000 })
//     );

//     translateX.value = withRepeat(
//       withSequence(
//         withTiming(Math.random() * 50 - 25, { duration: 800 }),
//         withTiming(Math.random() * 50 - 25, { duration: 800 })
//       ),
//       -1,
//       true
//     );

//     rotation.value = withRepeat(
//       withTiming(360, { duration: 2000 }),
//       -1
//     );
//   }, []);

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [
//       { translateY: translateY.value },
//       { translateX: translateX.value },
//       { rotate: `${rotation.value}deg` },
//     ],
//   }));

//   const colors = ['#FFD700', '#FF6B35', '#F7931E', '#FF1744', '#E91E63'];
//   const confettiColor = colors[index % colors.length];

//   return (
//     <AnimatedView
//       style={[
//         styles.confetti,
//         {
//           backgroundColor: confettiColor,
//           left: Math.random() * width,
//         },
//         animatedStyle,
//       ]}
//     />
//   );
// };

// // Composant pour l'écran de fin de partie
// const GameEndModal = ({
//   visible,
//   result,
//   isWinner,
//   onNewGame,
//   onRematch,
//   onMainMenu,
//   onAnalyze
// }: {
//   visible: boolean;
//   result: string;
//   isWinner: boolean;
//   onNewGame: () => void;
//   onRematch: () => void;
//   onMainMenu: () => void;
//   onAnalyze: () => void;
// }) => {
//   const scale = useSharedValue(0);
//   const opacity = useSharedValue(0);
//   const confettiVisible = useSharedValue(0);

//   useEffect(() => {
//     if (visible) {
//       opacity.value = withTiming(1, { duration: 300 });
//       scale.value = withSequence(
//         withTiming(1.1, { duration: 300 }),
//         withTiming(1, { duration: 200 })
//       );

//       if (isWinner) {
//         confettiVisible.value = withDelay(200, withTiming(1, { duration: 100 }));
//       }
//     } else {
//       opacity.value = withTiming(0, { duration: 200 });
//       scale.value = withTiming(0, { duration: 200 });
//       confettiVisible.value = withTiming(0, { duration: 100 });
//     }
//   }, [visible, isWinner]);

//   const modalStyle = useAnimatedStyle(() => ({
//     opacity: opacity.value,
//     transform: [{ scale: scale.value }],
//   }));

//   const getResultText = () => {
//     if (result === 'checkmate') {
//       return isWinner ? 'VICTOIRE!' : 'DÉFAITE';
//     } else if (result === 'stalemate' || result === 'draw') {
//       return 'MATCH NUL';
//     } else if (result === 'resigned') {
//       return isWinner ? 'VICTOIRE PAR ABANDON' : 'ABANDON';
//     }
//     return 'PARTIE TERMINÉE';
//   };

//   const getResultIcon = () => {
//     if (result === 'checkmate') {
//       return isWinner ? '👑' : '💔';
//     } else if (result === 'stalemate' || result === 'draw') {
//       return '🤝';
//     } else if (result === 'resigned') {
//       return isWinner ? '🏆' : '😔';
//     }
//     return '⚡';
//   };

//   const getResultColor = () => {
//     if (result === 'checkmate' || result === 'resigned') {
//       return isWinner ? '#4CAF50' : '#F44336';
//     }
//     return '#FF9800';
//   };

//   return (
//     <Modal visible={visible} transparent animationType="none">
//       <View style={styles.gameEndOverlay}>
//         {/* Confettis pour la victoire */}
//         {isWinner && (
//           <View style={StyleSheet.absoluteFill} pointerEvents="none">
//             {Array.from({ length: 20 }).map((_, i) => (
//               <ConfettiPiece key={i} index={i} />
//             ))}
//           </View>
//         )}

//         <AnimatedView style={[styles.gameEndModal, modalStyle]}>
//           <View style={[styles.gameEndHeader, { backgroundColor: getResultColor() }]}>
//             <Text style={styles.gameEndIcon}>{getResultIcon()}</Text>
//             <Text style={styles.gameEndTitle}>{getResultText()}</Text>
//           </View>

//           <View style={styles.gameEndContent}>
//             <Text style={styles.gameEndSubtitle}>
//               {result === 'checkmate' && (isWinner ? 'Échec et mat! Excellente partie!' : 'Échec et mat. Bien joué!')}
//               {result === 'stalemate' && 'Position de pat - égalité'}
//               {result === 'draw' && 'Match nul par accord mutuel'}
//               {result === 'resigned' && (isWinner ? 'Votre adversaire a abandonné' : 'Vous avez abandonné la partie')}
//             </Text>

//             <View style={styles.gameEndButtons}>
//               <TouchableOpacity style={styles.gameEndButton} onPress={onRematch}>
//                 <Text style={styles.gameEndButtonText}>🔄 Revanche</Text>
//               </TouchableOpacity>

//               <TouchableOpacity style={styles.gameEndButton} onPress={onNewGame}>
//                 <Text style={styles.gameEndButtonText}>🆕 Nouvelle Partie</Text>
//               </TouchableOpacity>

//               <TouchableOpacity style={[styles.gameEndButton, styles.analyzeButton]} onPress={onAnalyze}>
//                 <Text style={styles.gameEndButtonText}>📊 Analyser (Bientôt)</Text>
//               </TouchableOpacity>

//               <TouchableOpacity style={[styles.gameEndButton, styles.menuButton]} onPress={onMainMenu}>
//                 <Text style={styles.gameEndButtonText}>🏠 Menu Principal</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </AnimatedView>
//       </View>
//     </Modal>
//   );
// };

// // Composant d'attente d'adversaire amélioré
// const WaitingForOpponent = () => {
//   const pulseAnim = useSharedValue(1);
//   const router = useRouter();

//   useEffect(() => {
//     pulseAnim.value = withRepeat(
//       withSequence(
//         withTiming(1.1, { duration: 1000 }),
//         withTiming(1, { duration: 1000 })
//       ),
//       -1
//     );
//   }, []);

//   const pulseStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: pulseAnim.value }],
//   }));

//   return (
//     <ImageBackground source={lobby} style={styles.background} resizeMode="cover">
//       <View style={styles.overlay}>
//         <TouchableOpacity style={styles.backButton} onPress={() => router.push('/main')}>
//           <ArrowLeft size={28} color={'#FFF8E1'} />
//         </TouchableOpacity>
//         <View style={styles.waitingContainer}>
//           <AnimatedText style={[styles.waitingTitle, pulseStyle]}>
//             Recherche d'Adversaire
//           </AnimatedText>
//           <ActivityIndicator size="large" color="#D4AF37" style={styles.spinner} />
//           <Text style={styles.waitingText}>
//             Veuillez patienter pendant que nous trouvons un adversaire...
//           </Text>
//           <View style={styles.waitingDots}>
//             {[0, 1, 2].map((i) => (
//               <AnimatedView
//                 key={i}
//                 style={[
//                   styles.dot,
//                   useAnimatedStyle(() => ({
//                     opacity: interpolate(
//                       pulseAnim.value,
//                       [1, 1.1],
//                       [0.3, 1],
//                       Extrapolation.CLAMP
//                     ),
//                     transform: [
//                       {
//                         scale: withDelay(
//                           i * 200,
//                           interpolate(pulseAnim.value, [1, 1.1], [0.8, 1.2])
//                         ),
//                       },
//                     ],
//                   })),
//                 ]}
//               />
//             ))}
//           </View>
//         </View>
//       </View>
//     </ImageBackground>
//   );
// };

// // Composant modal amélioré pour mobile
// const ImprovedModal = ({
//   visible,
//   onClose,
//   title,
//   children
// }: {
//   visible: boolean;
//   onClose: () => void;
//   title: string;
//   children: React.ReactNode;
// }) => {
//   const translateY = useSharedValue(height);

//   useEffect(() => {
//     translateY.value = visible
//       ? withTiming(0, { duration: 300 })
//       : withTiming(height, { duration: 300 });
//   }, [visible]);

//   const modalStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: translateY.value }],
//   }));

//   return (
//     <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
//       <View style={styles.improvedModalOverlay}>
//         <TouchableOpacity
//           style={styles.modalBackdrop}
//           activeOpacity={1}
//           onPress={onClose}
//         />
//         <AnimatedView style={[styles.improvedModalContent, modalStyle]}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalHeaderTitle}>{title}</Text>
//             <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//               <Text style={styles.closeButtonText}>✕</Text>
//             </TouchableOpacity>
//           </View>
//           <View style={styles.modalBody}>
//             {children}
//           </View>
//         </AnimatedView>
//       </View>
//     </Modal>
//   );
// };

// export default function GameScreen() {
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const socket = useSocket();
//   const boardRef = useRef<ChessboardRef>(null);
//   const playerColor = usePlayerColor();
//   const prevFenRef = useRef<string | null>(null);

//   const [showConfirm, setShowConfirm] = useState(false);
//   const [showMoves, setShowMoves] = useState(false);
//   const [showCoach, setShowCoach] = useState(false);
//   const [gameEndData, setGameEndData] = useState<{
//     visible: boolean;
//     result: string;
//     isWinner: boolean;
//   }>({ visible: false, result: '', isWinner: false });

//   const { currentId, fen, moves, assistantEnabled, mode } = useAppSelector((s) => s.game);
//   const user = useAppSelector((state) => state.auth.user);

//   const chess = useMemo(() => newChess(fen), [fen]);
//   const turn = useMemo(() => chess.turn(), [chess]);

//   // Gestion des événements socket
//   useEffect(() => {
//     if (!socket) return;
//     let mounted = true;

//     socket.on('joined', (p: any) => {
//       if (!mounted) return;
//       console.log('📥 joined reçu:', JSON.stringify(p, null, 2));
//     });

//     socket.on('gameOver', (p: any) => {
//       if (!mounted) return;
//       console.log('📥 gameOver reçu:', JSON.stringify(p, null, 2));

//       const userId = user?._id;
//       const isWinner = p.winnerId === userId;

//       setGameEndData({
//         visible: true,
//         result: p.result || 'unknown',
//         isWinner,
//       });
//     });

//     socket.on('suggestionReceived', (p: any) => {
//       if (!mounted) return;
//       const raw = p.suggestions || {};
//       const moves = raw.suggestions || [];
//       const reasons = raw.explanations || [];
//       const suggestions = moves.map((m: string, i: number) => ({
//         move: m,
//         reason: reasons[i] ?? 'Suggestion IA',
//       }));
//       dispatch(setSuggestions(suggestions));
//       dispatch(setLoading(false));
//     });

//     return () => {
//       mounted = false;
//       socket.off('joined');
//       socket.off('gameOver');
//       socket.off('suggestionReceived');
//     };
//   }, [socket, dispatch, user?._id]);

//   // Gestion des mouvements
//   useEffect(() => {
//     if (!currentId || !socket) return;
//     let mounted = true;

//     socket.emit('joinGame', { gameId: currentId });

//     socket.on('movePlayed', (payload: any) => {
//       if (!mounted) return;
//       const receivedFen = payload.game.fen;
//       const currentFenInStore = fen;
//       const chessReceived = new Chess(receivedFen);
//       const chessCurrent = new Chess(currentFenInStore);
//       if (chessReceived.history().length > chessCurrent.history().length) {
//         dispatch(updateFromGameObject(payload.game));
//         if (payload.move) {
//           dispatch(appendMove(payload.move));
//         }
//       }
//     });

//     socket.on('yourTurn', (p: any) => {
//       if (!mounted) return;
//       if (p?.game?.fen !== fen) {
//         if (p?.game) {
//           dispatch(updateFromGameObject(p.game));
//           if (p.lastMove) {
//             dispatch(appendMove(p.lastMove));
//           }
//         }
//       }
//     });

//     return () => {
//       mounted = false;
//       socket.off('movePlayed');
//       socket.off('yourTurn');
//     };
//   }, [socket, currentId, fen, dispatch]);

//   // Redirection si pas de partie
//   useEffect(() => {
//     if (!currentId) {
//       router.replace('/main');
//     }
//   }, [currentId, router]);

//   // Synchronisation du plateau
//   useEffect(() => {
//     if (!fen || !boardRef.current) return;
//     const prevFen = prevFenRef.current;
//     if (!prevFen) {
//       boardRef.current.resetBoard(fen);
//       prevFenRef.current = fen;
//       return;
//     }
//     if (prevFen === fen) return;

//     const lastMove = extractLastMove(prevFen, fen);
//     if (lastMove) {
//       boardRef.current.move({ from: lastMove.from, to: lastMove.to });
//     } else {
//       boardRef.current.resetBoard(fen);
//     }
//     prevFenRef.current = fen;
//   }, [fen]);

//   // Fonctions de jeu
//   async function onMove(from: string, to: string) {
//     if (!currentId) return;
//     try {
//       dispatch(setLoading(true));
//       socket.emit('makeMove', { gameId: currentId, move: `${from}${to}` });
//     } catch (e: any) {
//       console.error('Erreur de mouvement:', e);
//     } finally {
//       dispatch(setLoading(false));
//     }
//   }

//   async function handleResign() {
//     if (!currentId) return;
//     try {
//       dispatch(setLoading(true));
//       socket.emit('resign', { gameId: currentId });
//     } catch (e: any) {
//       console.error('Erreur abandon:', e);
//     } finally {
//       dispatch(setLoading(false));
//       setShowConfirm(false);
//     }
//   }

//   async function askSuggestion() {
//     if (!assistantEnabled || !currentId) return;
//     try {
//       dispatch(setLoading(true));
//       socket.emit('getSuggestion', { gameId: currentId });
//     } catch (e) {
//       console.error('Erreur suggestion:', e);
//       dispatch(setLoading(false));
//     }
//   }

//   // Fonctions de fin de partie
//   const handleNewGame = () => {
//     setGameEndData({ visible: false, result: '', isWinner: false });
//     // Logique pour démarrer une nouvelle partie
//     router.replace('/main');
//   };

//   const handleRematch = () => {
//     setGameEndData({ visible: false, result: '', isWinner: false });
//     // Logique pour une revanche
//     router.replace('/main');
//   };

//   const handleMainMenu = () => {
//     setGameEndData({ visible: false, result: '', isWinner: false });
//     dispatch(resetGame());
//     router.replace('/main');
//   };

//   const handleAnalyze = () => {
//     // Fonctionnalité future
//     console.log('Analyse de la partie à implémenter');
//   };

//   if (!playerColor) {
//     return <WaitingForOpponent />;
//   }

//   const boardColor = {
//     black: '#481f01',
//     white: '#eeeed2',
//     lastMoveHighlight: 'rgba(255, 255, 0, 0.5)',
//     checkmateHighlight: '#E84855',
//     promotionPieceButton: '#FF9B71',
//   };

//   return (
//     <ImageBackground source={lobby} style={styles.background} resizeMode="cover">
//       <View style={styles.overlay}>
//         <View style={styles.boardContainer}>
//           <Chessboard
//             ref={boardRef}
//             onMove={async (info: any) => {
//               const pieceColor = info.move.color;
//               if (pieceColor !== playerColor || turn !== playerColor) {
//                 setTimeout(() => {
//                   boardRef.current?.resetBoard(fen);
//                 }, 50);
//                 return false;
//               }
//               try {
//                 await onMove(info.move.from, info.move.to);
//                 return false;
//               } catch (e) {
//                 setTimeout(() => {
//                   boardRef.current?.resetBoard(fen);
//                 }, 50);
//                 return false;
//               }
//             }}
//             colors={boardColor}
//           />

//           <View style={styles.buttonRow}>
//             <TouchableOpacity onPress={() => setShowConfirm(true)} style={styles.actionButton}>
//               <Text style={styles.buttonText}>Abandonner</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => setShowMoves(true)} style={styles.actionButton}>
//               <Text style={styles.buttonText}>Historique</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => setShowCoach(true)} style={styles.actionButton}>
//               <Text style={styles.buttonText}>Coach IA</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Modales améliorées */}
//           <ImprovedModal
//             visible={showMoves}
//             onClose={() => setShowMoves(false)}
//             title="Historique des Coups"
//           >
//             <MoveList moves={moves} fullWidth />
//           </ImprovedModal>

//           <ImprovedModal
//             visible={showCoach}
//             onClose={() => setShowCoach(false)}
//             title="Coach IA"
//           >
//             <AssistantPanel onAsk={askSuggestion} fullWidth />
//           </ImprovedModal>

//           {/* Modal de confirmation d'abandon */}
//           <Modal
//             visible={showConfirm}
//             transparent
//             animationType="fade"
//             onRequestClose={() => setShowConfirm(false)}
//           >
//             <View style={styles.modalOverlay}>
//               <View style={styles.confirmModal}>
//                 <Text style={styles.confirmTitle}>Abandonner la Partie ?</Text>
//                 <Text style={styles.confirmText}>
//                   Êtes-vous sûr de vouloir abandonner la partie ?
//                 </Text>
//                 <View style={styles.confirmButtonRow}>
//                   <TouchableOpacity
//                     style={[styles.confirmButton, styles.cancelButton]}
//                     onPress={() => setShowConfirm(false)}
//                   >
//                     <Text style={styles.cancelButtonText}>Annuler</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity style={styles.confirmButton} onPress={handleResign}>
//                     <Text style={styles.confirmButtonText}>Abandonner</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </View>
//           </Modal>

//           {/* Modal de fin de partie */}
//           <GameEndModal
//             visible={gameEndData.visible}
//             result={gameEndData.result}
//             isWinner={gameEndData.isWinner}
//             onNewGame={handleNewGame}
//             onRematch={handleRematch}
//             onMainMenu={handleMainMenu}
//             onAnalyze={handleAnalyze}
//           />
//         </View>
//       </View>
//     </ImageBackground>
//   );
// }

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     width: '100%',
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//   },
//   boardContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 12,
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     gap: 12,
//     marginTop: 20,
//   },
//   actionButton: {
//     backgroundColor: '#8B4513',
//     borderWidth: 2,
//     borderColor: '#D4AF37',
//     borderRadius: 12,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     alignItems: 'center',
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   buttonText: {
//     color: '#FFF8E1',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   backButton: {
//     position: 'absolute',
//     top: 50,
//     left: 20,
//     padding: 8,
//     zIndex: 10,
//   },
//   waitingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   waitingTitle: {
//     fontFamily: 'CinzelDecorative-Bold',
//     fontSize: 28,
//     color: '#FFF8E1',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   waitingText: {
//     color: '#E0E0E0',
//     fontSize: 16,
//     textAlign: 'center',
//     marginTop: 15,
//   },
//   spinner: {
//     marginVertical: 20,
//   },
//   waitingDots: {
//     flexDirection: 'row',
//     gap: 8,
//     marginTop: 20,
//   },
//   dot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#D4AF37',
//   },
//   // Styles pour les modales améliorées
//   improvedModalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.8)',
//   },
//   modalBackdrop: {
//     flex: 1,
//   },
//   improvedModalContent: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: '#1E1E2D',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: height * 0.85,
//     borderWidth: 2,
//     borderColor: '#D4AF37',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#333',
//   },
//   modalHeaderTitle: {
//     fontFamily: 'CinzelDecorative-Bold',
//     fontSize: 20,
//     color: '#FFF8E1',
//   },
//   closeButton: {
//     padding: 8,
//   },
//   closeButtonText: {
//     color: '#D4AF37',
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   modalBody: {
//     flex: 1,
//     padding: 20,
//   },
//   // Styles pour la modal de confirmation
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   confirmModal: {
//     width: '85%',
//     backgroundColor: '#1E1E2D',
//     borderRadius: 15,
//     padding: 25,
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#D4AF37',
//     elevation: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//   },
//   confirmTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#FFF8E1',
//     marginBottom: 10,
//     fontFamily: 'CinzelDecorative-Bold',
//   },
//   confirmText: {
//     fontSize: 16,
//     color: '#E0E0E0',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   confirmButtonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     gap: 10,
//   },
//   confirmButton: {
//     backgroundColor: '#c43333',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//     flex: 1,
//     alignItems: 'center',
//     elevation: 3,
//   },
//   cancelButton: {
//     backgroundColor: '#8B4513',
//   },
//   confirmButtonText: {
//     color: '#FFF8E1',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   cancelButtonText: {
//     color: '#FFF8E1',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   // Styles pour la modal de fin de partie
//   gameEndOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.9)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//     gameEndModal: {
//     width: '90%',
//     backgroundColor: '#1E1E2D',
//     borderRadius: 20,
//     overflow: 'hidden',
//     elevation: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.5,
//     shadowRadius: 15,
//   },
//   gameEndHeader: {
//     padding: 25,
//     alignItems: 'center',
//     borderBottomWidth: 2,
//     borderBottomColor: 'rgba(255,255,255,0.1)',
//   },
//   gameEndIcon: {
//     fontSize: 60,
//     marginBottom: 10,
//   },
//   gameEndTitle: {
//     fontFamily: 'CinzelDecorative-Bold',
//     fontSize: 28,
//     color: '#FFF8E1',
//     textAlign: 'center',
//     fontWeight: 'bold',
//   },
//   gameEndContent: {
//     padding: 25,
//   },
//   gameEndSubtitle: {
//     fontSize: 16,
//     color: '#E0E0E0',
//     textAlign: 'center',
//     marginBottom: 30,
//     lineHeight: 22,
//   },
//   gameEndButtons: {
//     gap: 15,
//   },
//   gameEndButton: {
//     backgroundColor: '#8B4513',
//     paddingVertical: 15,
//     paddingHorizontal: 25,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: '#D4AF37',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   gameEndButtonText: {
//     color: '#FFF8E1',
//     fontSize: 16,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   analyzeButton: {
//     backgroundColor: '#4A5568',
//     borderColor: '#9CA3AF',
//   },
//   menuButton: {
//     backgroundColor: '#2D3748',
//     borderColor: '#718096',
//   },
//   // Styles pour les confettis
//   confetti: {
//     position: 'absolute',
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//   },
// });
