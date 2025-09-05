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
} from 'react-native';
import FloatingPiece from '../../components/FloatingPiece';
import TransitionScreen from '../../components/TransitionScreen';
import { useAppDispatch } from '../../store';
import { setMode, updateFromGameObject } from '../../store/gameSlice';

import { useAudioPlayer } from 'expo-audio';
import Game from '../../assets/images/threeheadpiece.png';
import lobby from '../../assets/images/woodenbg.jpg';
import clickSound from '../../assets/sound/click.mp3';

export default function LobbyScreen() {
  const click = useAudioPlayer(clickSound);
  const socket = useSocket();
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
      //Reset after executing to avoid being stuck on TransitionScreen
      setIsTransitioning(false);
      setGameModeAction(null);
    }
  };

  const handleGameModeSelection = (action: () => void) => {
    setGameModeAction(() => action);
    setIsTransitioning(true);
  };

  function startAI() {
    console.log('Début du jeu contre l’IA');
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

  // function joinQueue() {
  //   console.log('🔹 Rejoindre la file online');
  //   dispatch(setMode('online'));

  //   socket.emit('joinQueue', { timeControl: '300+0' });

  //   socket.once('matchFound', (data: any) => {
  //     if (data && data._id) {
  //       Alert.alert('Match trouvé', 'Redirection vers la partie…');
  //       dispatch(updateFromGameObject(data));
  //       router.push('/main/game');
  //     } else {
  //       Alert.alert('En attente', 'En attente d’un adversaire…');
  //       // L'écran de jeu écoutera les events socket (matchFound/movePlayed)

  //       router.push('/main/game');
  //     }
  //   });
  // }

  function joinQueue() {
    console.log('🔹 Rejoindre la file online');
    dispatch(setMode('online'));
    // On n'écoute plus d'événements ici.
    // On se contente d'émettre l'événement de rejoindre la file.
    socket.emit('joinQueue', { timeControl: '300+0' });

    // On navigue immédiatement vers l'écran d'attente.
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
          {/* Profile Card */}
          <View style={[styles.profileCard, styles.shadow]}>
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
              <Text style={styles.welcome}> {user?.displayName || 'Guest'}</Text>
            </View>

            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => {
                router.push('/settings/SettingsScreen');
              }}
            >
              <Settings color="#fff" size={20} onPress={() => click.play()} />
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
            onPress={() => {
              click.play();
              handleGameModeSelection(() => router.push('/main/PlayLocal'));
            }}
          >
            <Text style={styles.modeText}>♟ PLAY OFFLINE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeBtn, styles.shadow]}
            onPress={() => {
              click.play();
              handleGameModeSelection(startAI);
            }}
          >
            <Text style={styles.modeText}>♟ PLAY VS AI</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, styles.shadow]}
            onPress={() => {
              click.play();
              handleGameModeSelection(joinQueue);
            }}
          >
            <Text style={styles.modeText}>♟ JOIN ONLINE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, styles.shadow]}
            onPress={() => {
              click.play();
              handleGameModeSelection(() => router.push('/settings/LessonScreen'));
            }}
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

  // eslint-disable-next-line react-native/no-color-literals
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
