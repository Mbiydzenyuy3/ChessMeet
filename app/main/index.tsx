// /* eslint-disable react-native/no-color-literals */
// /* eslint-disable react-native/no-inline-styles */
// /* eslint-disable @typescript-eslint/no-explicit-any */

// import { COLORS } from '@/constants/colors';
// import { useAuth } from '@/hooks/useAuth';
// import { useRouter } from 'expo-router';
// import { Settings } from 'lucide-react-native';
// import React, { useState } from 'react';
// import {
//   Alert,
//   Image,
//   ImageBackground,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import {
//   useSharedValue,
//   withDelay,
//   withRepeat,
//   withSequence,
//   withSpring,
//   withTiming,
// } from 'react-native-reanimated';
// import FloatingPiece from '../../components/FloatingPiece';
// import TransitionScreen from '../../components/TransitionScreen';
// import { api } from '../../lib/api';
// import { useAppDispatch } from '../../store';
// import { createVsAI, setMode } from '../../store/gameSlice';

// import Game from '../../assets/images/threeheadpiece.png';
// import lobby from '../../assets/images/woodenbg.jpg';

// export default function LobbyScreen() {
//   // ✅ All hooks are now at the top level
//   const router = useRouter();
//   const { user } = useAuth();
//   const dispatch = useAppDispatch();
//   const [isTransitioning, setIsTransitioning] = useState(false);
//   const [gameModeAction, setGameModeAction] = useState<(() => void) | null>(null);

//   // The only job of this function is to execute the game start/navigation action.
//   // We do not need to reset the state here.
//   const onTransitionEnd = () => {
//     if (gameModeAction) {
//       gameModeAction();
//     }
//   };

//   // Scale animations for cards
//   const multiplayerScale = useSharedValue(0.8);
//   const aiScale = useSharedValue(0.8);
//   const lessonsScale = useSharedValue(0.8);

//   React.useEffect(() => {
//     multiplayerScale.value = withDelay(100, withSpring(1, { damping: 6 }));
//     aiScale.value = withDelay(250, withSpring(1, { damping: 6 }));
//     lessonsScale.value = withDelay(400, withSpring(1, { damping: 6 }));
//   }, []);

//   const floatingPieces = Array.from({ length: 6 }).map((_, i) => ({
//     translateY: useSharedValue(0),
//     opacity: useSharedValue(0.1),
//     delay: i * 300,
//   }));

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

//   const handleGameModeSelection = (action: () => void) => {
//     setGameModeAction(() => action);
//     setIsTransitioning(true);
//   };

//   async function startAI() {
//     await dispatch(createVsAI('300+0')).unwrap();
//     dispatch(setMode('ai'));
//     router.push('/main/game');
//   }

//   async function joinQueue() {
//     try {
//       const { data } = await api.post('/matchmaking/join', { timeControl: '300+0' });
//       dispatch(setMode('online'));
//       if (data && data._id) {
//         Alert.alert('Match trouvé', 'Redirection vers la partie…');
//         router.push('/main/game');
//       } else {
//         Alert.alert('En file', "En attente d'un adversaire…");
//         router.push('/main/game');
//       }
//     } catch (e: any) {
//       Alert.alert('Erreur', e?.response?.data?.message || 'Matchmaking indisponible');
//     }
//   }

//   const chessSymbols = ['♔', '♕', '♖', '♗', '♘', '♙'];

//   // ✅ The conditional return is now placed after all hooks have been called
//   if (isTransitioning) {
//     return <TransitionScreen onAnimationFinish={onTransitionEnd} />;
//   }

//   return (
//     <View style={styles.container}>
//       {/* Floating background pieces */}
//       {/* ✅ Use the new FloatingPiece component */}
//       <View style={StyleSheet.absoluteFill} pointerEvents="none">
//         {chessSymbols.map((symbol, index) => (
//           <FloatingPiece key={index} symbol={symbol} index={index} />
//         ))}
//       </View>

//       <ImageBackground source={lobby} style={styles.background} resizeMode="cover">
//         <View style={styles.overlay}>
//           {/* Profile Card */}
//           <View style={[styles.profileCard, styles.shadow]}>
//             <View style={styles.headerItems}>
//               <TouchableOpacity onPress={() => router.push('/main/profile')}>
//                 <Image
//                   source={{
//                     uri:
//                       user?.avatarUrl ||
//                       'https://i.pinimg.com/474x/fa/d5/e7/fad5e79954583ad50ccb3f16ee64f66d.jpg',
//                   }}
//                   style={styles.avatar}
//                 />
//               </TouchableOpacity>
//               <Text style={styles.welcome}> {user?.displayName || 'Guest'}</Text>
//             </View>

//             <TouchableOpacity
//               style={styles.settingsBtn}
//               onPress={() => router.push('/settings/SettingsScreen')}
//             >
//               <Settings color="#fff" size={20} />
//             </TouchableOpacity>
//           </View>

//           {/* Chess Icon Center */}
//           <View style={styles.centerPiece}>
//             <Image source={Game} style={{ width: 180, height: 180, resizeMode: 'contain' }} />
//           </View>

//           {/* Choose Mode */}
//           <Text style={styles.chooseText}>CHOOSE A GAME MODE</Text>

//           {/* Buttons */}
//           <TouchableOpacity
//             style={[styles.modeBtn, styles.shadow]}
//             onPress={() => handleGameModeSelection(() => router.push('/main/PlayLocal'))}
//           >
//             <Text style={styles.modeText}>♟ PLAY OFFLINE</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.modeBtn, styles.shadow]}
//             onPress={() => handleGameModeSelection(startAI)}
//           >
//             <Text style={styles.modeText}>♟ PLAY VS AI</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.modeBtn, styles.shadow]}
//             onPress={() => handleGameModeSelection(joinQueue)}
//           >
//             <Text style={styles.modeText}>♟ JOIN ONLINE</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.modeBtn, styles.shadow]}
//             onPress={() => router.push('/settings/LessonScreen')}
//           >
//             <Text style={styles.modeText}>♟ LEARN CHESS</Text>
//           </TouchableOpacity>
//         </View>
//       </ImageBackground>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   background: { flex: 1, alignItems: 'center', justifyContent: 'flex-start' },
//   profileCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.profileCard,
//     padding: 10,
//     borderRadius: 12,
//     width: '90%',
//     justifyContent: 'space-between',
//   },

//   shadow: {
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 24,
//     },
//     shadowOpacity: 0.5,
//     shadowRadius: 4.65,
//     elevation: 8,
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     width: '100%',
//     height: '100%',
//     paddingTop: 40,
//     alignItems: 'center',
//   },
//   avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
//   settingsBtn: {
//     backgroundColor: COLORS.settingsBtn,
//     padding: 6,
//     marginBottom: 6,
//     borderRadius: 20,
//   },
//   welcome: { fontSize: 24, fontWeight: '700', color: COLORS.whitetext },
//   centerPiece: {
//     marginTop: 40,
//     marginBottom: 30,
//     alignItems: 'center',
//   },
//   chooseText: {
//     fontSize: 18,
//     color: COLORS.white,
//     fontWeight: '800',
//     marginBottom: 20,
//     fontFamily: 'MidnightMinutes',
//   },
//   headerItems: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modeBtn: {
//     backgroundColor: COLORS.modeBtn,
//     paddingVertical: 14,
//     paddingHorizontal: 60,
//     borderRadius: 10,
//     marginVertical: 10,
//     width: '80%',
//     alignItems: 'center',
//   },
//   modeText: {
//     color: COLORS.white,
//     fontSize: 16,
//     fontWeight: '900',
//     fontFamily: 'MidnightMinutes',
//   },
// });

/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { COLORS } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
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
} from 'react-native';
import FloatingPiece from '../../components/FloatingPiece';
import TransitionScreen from '../../components/TransitionScreen';
import { api } from '../../lib/api';
import { useAppDispatch } from '../../store';
import { createVsAI, setMode } from '../../store/gameSlice';

import Game from '../../assets/images/threeheadpiece.png';
import lobby from '../../assets/images/woodenbg.jpg';

export default function LobbyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [gameModeAction, setGameModeAction] = useState<(() => void) | null>(null);

  // ✅ CORRECTED FUNCTION
  // The only job of this function is to execute the game start/navigation action.
  // We do not need to reset the state here.
  const onTransitionEnd = () => {
    if (gameModeAction) {
      gameModeAction();
    }
  };

  const handleGameModeSelection = (action: () => void) => {
    setGameModeAction(() => action);
    setIsTransitioning(true);
  };

  async function startAI() {
    await dispatch(createVsAI('300+0')).unwrap();
    dispatch(setMode('ai'));
    router.push('/main/game');
  }

  async function joinQueue() {
    try {
      const { data } = await api.post('/matchmaking/join', { timeControl: '300+0' });

      if (data && data._id) {
        dispatch(setMode('online'));

        Alert.alert('Match trouvé', 'Redirection vers la partie…');
        router.push('/main/game');
      } else {
        dispatch(setMode('online'));
        Alert.alert('En file', "En attente d'un adversaire…");
        router.push('/main/game');
      }
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || 'Matchmaking indisponible');
    }
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
          {/* Profile Card */}
          <View style={[styles.profileCard, styles.shadow]}>
            <View style={styles.headerItems}>
              <TouchableOpacity onPress={() => router.push('/main/profile')}>
                <Image
                  source={{
                    uri:
                      user?.avatarUrl ||
                      'https://i.pinimg.com/474x/fa/d5/e7/fad5e79954583ad50ccb3f16ee64f66d.jpg',
                  }}
                  style={styles.avatar}
                />
              </TouchableOpacity>
              <Text style={styles.welcome}> {user?.displayName || 'Guest'}</Text>
            </View>

            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => router.push('/settings/SettingsScreen')}
            >
              <Settings color="#fff" size={20} />
            </TouchableOpacity>
          </View>

          {/* Chess Icon Center */}
          <View style={styles.centerPiece}>
            <Image source={Game} style={{ width: 180, height: 180, resizeMode: 'contain' }} />
          </View>

          {/* Choose Mode */}
          <Text style={styles.chooseText}>CHOOSE A GAME MODE</Text>

          {/* Buttons */}
          <TouchableOpacity
            style={[styles.modeBtn, styles.shadow]}
            onPress={() => handleGameModeSelection(() => router.push('/main/PlayLocal'))}
          >
            <Text style={styles.modeText}>♟ PLAY OFFLINE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeBtn, styles.shadow]}
            onPress={() => handleGameModeSelection(startAI)}
          >
            <Text style={styles.modeText}>♟ PLAY VS AI</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, styles.shadow]}
            onPress={() => handleGameModeSelection(joinQueue)}
          >
            <Text style={styles.modeText}>♟ JOIN ONLINE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, styles.shadow]}
            onPress={() => router.push('/settings/LessonScreen')}
          >
            <Text style={styles.modeText}>♟ LEARN CHESS</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, alignItems: 'center', justifyContent: 'flex-start' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.profileCard,
    padding: 10,
    borderRadius: 12,
    width: '90%',
    justifyContent: 'space-between',
  },

  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 24,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4.65,
    elevation: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: '100%',
    height: '100%',
    paddingTop: 40,
    alignItems: 'center',
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  settingsBtn: {
    backgroundColor: COLORS.settingsBtn,
    padding: 6,
    marginBottom: 6,
    borderRadius: 20,
  },
  welcome: { fontSize: 24, fontWeight: '700', color: COLORS.whitetext },
  centerPiece: {
    marginTop: 40,
    marginBottom: 30,
    alignItems: 'center',
  },
  chooseText: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: '800',
    marginBottom: 20,
    fontFamily: 'MidnightMinutes',
  },
  headerItems: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeBtn: {
    backgroundColor: COLORS.modeBtn,
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  modeText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'MidnightMinutes',
  },
});
