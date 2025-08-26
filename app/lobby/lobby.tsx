// // screens/LobbyScreen.tsx
// import api from '@/api/api';
// import { COLORS } from '@/constants/colors';
// import { useAuth } from '@/hooks/useAuth';
// import type { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { Book, Bot, Users } from 'lucide-react-native';
// import React, { useState } from 'react';
// import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import Animated, {
//   useAnimatedStyle,
//   useSharedValue,
//   withDelay,
//   withRepeat,
//   withSequence,
//   withSpring,
//   withTiming,
// } from 'react-native-reanimated';
// import type { RootStackParamList } from '../../types/navigation';

// // const { width, height } = Dimensions.get('window');
// const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
// const AnimatedText = Animated.createAnimatedComponent(Text);
// type Props = NativeStackScreenProps<RootStackParamList, 'Lobby'>;

// export default function LobbyScreen({ navigation }: Props) {
//   const { user } = useAuth();
//   const [stats, setStats] = useState(null);
//   const [history, setHistory] = useState([]);
//   // Scale animations for cards
//   const multiplayerScale = useSharedValue(0.8);
//   const aiScale = useSharedValue(0.8);
//   const lessonsScale = useSharedValue(0.8);
//   // const playButtonScale = useSharedValue(1);

//   const multiplayerStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: multiplayerScale.value }],
//   }));
//   const aiStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: aiScale.value }],
//   }));
//   const lessonsStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: lessonsScale.value }],
//   }));
//   // const playButtonStyle = useAnimatedStyle(() => ({
//   //   transform: [{ scale: playButtonScale.value }],
//   // }));

//   // Animate cards on mount
//   React.useEffect(() => {
//     multiplayerScale.value = withDelay(100, withSpring(1, { damping: 6 }));
//     aiScale.value = withDelay(250, withSpring(1, { damping: 6 }));
//     lessonsScale.value = withDelay(400, withSpring(1, { damping: 6 }));
//   }, []);

//   // Floating pieces shared values
//   const floatingPieces = Array.from({ length: 6 }).map((_, i) => ({
//     translateY: useSharedValue(0),
//     opacity: useSharedValue(0.1),
//     delay: i * 300,
//   }));

//   // Animate floating pieces (looping up & down)
//   React.useEffect(() => {
//     floatingPieces.forEach((piece) => {
//       piece.translateY.value = withRepeat(
//         withSequence(
//           withDelay(piece.delay, withTiming(-20, { duration: 3000 })),
//           withTiming(20, { duration: 3000 })
//         ),
//         -1,
//         true
//       );
//     });
//   }, []);

//   // Play button bounce
//   // const handlePlayPress = () => {
//   //   playButtonScale.value = withSequence(withSpring(0.9), withSpring(1.05), withSpring(1));
//   //   // navigation logic here
//   // };

//   React.useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = await api.acessToken(); // however you store JWT
//         const headers = { Authorization: `Bearer ${token}` };

//         // fetch stats
//         const statsRes = await api.post('http://localhost:3000/user/me/stats', { headers });
//         const statsData = await statsRes.json();
//         setStats(statsData);

//         // fetch game history
//         const historyRes = await api.post('http://localhost:3000/games/my/history?limit=5', {
//           headers,
//         });
//         const historyData = await historyRes.json();
//         setHistory(historyData);
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     fetchData();
//   }, []);

//   const chessSymbols = ['♔', '♕', '♖', '♗', '♘', '♙'];

//   return (
//     <View style={styles.container}>
//       {/* Floating background pieces */}
//       <View style={StyleSheet.absoluteFill}>
//         {chessSymbols.map((piece, index) => {
//           const style = useAnimatedStyle(() => ({
//             transform: [{ translateY: floatingPieces[index].translateY.value }],
//             opacity: floatingPieces[index].opacity.value,
//           }));
//           return (
//             <AnimatedText
//               key={index}
//               style={[
//                 styles.floatingPiece,
//                 {
//                   left: `${10 + index * 15}%`,
//                   top: `${20 + (index % 2) * 40}%`,
//                 },
//                 style,
//               ]}
//             >
//               {piece}
//             </AnimatedText>
//           );
//         })}
//       </View>

//       {/* Header */}
//       <Text style={styles.welcome}>ChessMeet</Text>
//       <Text style={styles.subtitle}>Choose your game mode</Text>

//       {/* Game Options */}
//       <View style={styles.cardsContainer}>
//         <AnimatedTouchable
//           style={[styles.card, { backgroundColor: COLORS.primary }, multiplayerStyle]}
//           onPress={() => navigation.navigate('Local')}
//         >
//           <Users size={32} color="white" />
//           <Text style={styles.cardTitle}>Play Offline</Text>
//           <Text style={styles.cardDesc}>Play on locally with other players</Text>
//         </AnimatedTouchable>
//         <AnimatedTouchable
//           style={[styles.card, { backgroundColor: COLORS.primary }, multiplayerStyle]}
//           onPress={() => navigation.navigate('Multiplayer')}
//         >
//           <Users size={32} color="white" />
//           <Text style={styles.cardTitle}>Play vs Multiplayer</Text>
//           <Text style={styles.cardDesc}>Compete in real time online with other players</Text>
//         </AnimatedTouchable>

//         <AnimatedTouchable
//           style={[styles.card, { backgroundColor: COLORS.backgroundOne }, aiStyle]}
//           onPress={() => navigation.navigate('AI')}
//         >
//           <Bot size={32} color="white" />
//           <Text style={styles.cardTitle}>Play vs AI</Text>
//           <Text style={styles.cardDesc}>Challenge the robot</Text>
//         </AnimatedTouchable>

//         <AnimatedTouchable
//           style={[styles.card, { backgroundColor: COLORS.backgroundTwo }, lessonsStyle]}
//           onPress={() => navigation.navigate('GameRules')}
//         >
//           <Book size={32} color="white" />
//           <Text style={styles.cardTitle}>Game Rules</Text>
//           <Text style={styles.cardDesc}>
//             Your tour guide to winning your first game and many more
//           </Text>
//         </AnimatedTouchable>
//       </View>

//       {/* Play Now Button */}
//       {/* <AnimatedTouchable style={[styles.playButton, playButtonStyle]} onPress={handlePlayPress}>
//         <Text style={styles.playText}>Play Now</Text>
//       </AnimatedTouchable> */}
//       {stats && (
//         <View style={styles.statsBox}>
//           <Text style={styles.statText}>Games Played: {stats.stats.gamesPlayed}</Text>
//           <Text style={styles.statText}>Wins: {stats.stats.wins}</Text>
//           <Text style={styles.statText}>Losses: {stats.stats.losses}</Text>
//           <Text style={styles.statText}>Draws: {stats.stats.draws}</Text>
//           <Text style={styles.statText}>Resigned: {stats.stats.resigned}</Text>
//           <Text style={styles.statText}>Rating: {stats.rating}</Text>
//         </View>
//       )}

//       {history.length > 0 && (
//         <View style={styles.historyBox}>
//           <Text style={styles.historyTitle}>Recent Games</Text>
//           {history.map((game, idx) => {
//             const opponent =
//               game.whitePlayer._id === user?.id ? game.blackPlayer : game.whitePlayer;
//             return (
//               <Text key={game._id} style={styles.historyText}>
//                 {idx + 1}. vs {opponent.displayName || 'Unknown'} ({game.status})
//               </Text>
//             );
//           })}
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.BackgroundColor,
//     padding: 20,
//   },
//   welcome: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: COLORS.whitetext,
//     marginBottom: 6,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: COLORS.muted,
//     marginBottom: 20,
//   },
//   cardsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 16,
//     justifyContent: 'space-between',
//   },
//   card: {
//     width: '47%',
//     padding: 16,
//     borderRadius: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 4,
//   },
//   cardTitle: {
//     color: COLORS.white,
//     fontWeight: '700',
//     fontSize: 16,
//     marginTop: 10,
//   },
//   cardDesc: {
//     color: COLORS.white,
//     opacity: 0.8,
//     fontSize: 12,
//     marginTop: 4,
//     textAlign: 'center',
//   },
//   // playButton: {
//   //   backgroundColor: COLORS.ctaButton,
//   //   paddingVertical: 16,
//   //   borderRadius: 30,
//   //   marginTop: 'auto',
//   //   alignItems: 'center',
//   //   elevation: 6,
//   // },
//   // playText: {
//   //   color: COLORS.white,
//   //   fontSize: 18,
//   //   fontWeight: '700',
//   // },
//   floatingPiece: {
//     position: 'absolute',
//     fontSize: 48,
//     color: COLORS.white,
//     opacity: 0.08,
//   },
//   statsBox: {
//     backgroundColor: COLORS.backgroundOne,
//     padding: 12,
//     borderRadius: 10,
//     marginVertical: 12,
//   },
//   statText: { color: COLORS.white, fontSize: 14, marginBottom: 4 },

//   historyBox: { marginTop: 16 },
//   historyTitle: { color: COLORS.white, fontSize: 16, fontWeight: '600', marginBottom: 8 },
//   historyText: { color: COLORS.white, fontSize: 14, marginBottom: 4 },
// });
