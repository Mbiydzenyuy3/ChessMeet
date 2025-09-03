import { COLORS } from '@/constants/colors';
import { useSocket } from '@/hooks/useSocket';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateFromGameObject } from '@/store/gameSlice';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LoadingDots from 'react-native-loading-dots';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import image from '../../assets/images/woodenbg.jpg';

type Game = {
  _id: string;
  players: string[];
  whitePlayer: string;
  blackPlayer: string;
  status: string;
  fen: string;
  moves: string[]; // (you can refine this later)
  timeControl: string;
  createdAt: string;
  __v: number;
};

type GameStartedPayload = {
  game: Game;
};

export default function WaitingScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const socket = useSocket();

  // 👇 grab current gameId from redux
  const { currentId } = useAppSelector((s) => s.game);

  useEffect(() => {
    if (!currentId) {
      router.replace('/main');
      return;
    }

    // Join the game room
    socket.emit('joinGame', { gameId: currentId });

    // When the second player joins → server should emit "gameStarted"
    socket.on('gameStarted', (payload: GameStartedPayload) => {
      dispatch(updateFromGameObject(payload.game));
      router.replace('/main/game');
    });

    return () => {
      socket.off('gameStarted');
    };
  }, [socket, currentId]);

  return (
    <SafeAreaProvider>
      <ImageBackground style={styles.backgroundImage} resizeMode="cover" source={image}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/main')}>
            <ArrowLeft size={28} color={'#FFF8E1'} />
          </TouchableOpacity>
          <View style={styles.screen}>
            <View style={styles.container}>
              <Text style={styles.text}>Waiting for other player</Text>
              <LoadingDots bounceHeight={15} />
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginTop: 4,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
    color: COLORS.white,
  },
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    width: '100%',
    height: 1000,
    paddingBlock: 40,
    // Dark overlay for better text readability
    alignItems: 'center',
    // justifyContent: 'center',
    // paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 8,
    zIndex: 10,
  },
});
