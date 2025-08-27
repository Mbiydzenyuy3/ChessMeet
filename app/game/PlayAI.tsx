import { gameApi } from '@/api/gameApi';
import { connectSocket } from '@/components/sockets/io';
import { COLORS } from '@/constants/colors';
import { API_BASE_URL } from '@/constants/config';
import { useAppSelector } from '@/redux/slices/hooks';
import { RouteProp } from '@react-navigation/native';
import { Chess, Move, Square } from 'chess.js';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { DoorOpenIcon, Lightbulb, RotateCcwIcon, Undo2 } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Alert, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import Chessboard, { ChessboardRef } from 'react-native-chessboard';
import moveSoundFile from '../../assets/sound/Move.mp3';
import captureSoundFile from '../../assets/sound/Capture.mp3';

type AIScreenParams = {
  AI: {
    gameId?: string;
    token?: string;
  };
};

type AIRouteProp = RouteProp<AIScreenParams, 'AI'>;

interface ChessMoveInfo {
  move: Move;
  // We don't need to access state properties in our implementation
}

export default function PlayAI({ route }: { route: AIRouteProp }) {
  const { gameId: initialGameId, token: initialToken } = route.params || {};
  const [gameId, setGameId] = useState<string | null>(initialGameId || null);
  const [token, setToken] = useState<string | null>(initialToken || null);
  const [loading, setLoading] = useState<boolean>(!initialGameId || !initialToken);

  const chessboardRef = useRef<ChessboardRef>(null);
  const chess = useRef(new Chess()).current;
  const [fen, setFen] = useState(chess.fen());
  const moveRef = useRef<Audio.Sound | null>(null);
  const captureRef = useRef<Audio.Sound | null>(null);
  const router = useRouter();

  // Get token from Redux if not provided in params
  const reduxToken = useAppSelector((state) => state.auth.token);

  // Load sounds
  useEffect(() => {
    const loadSounds = async () => {
      try {
        const moveSound = new Audio.Sound();
        const captureSound = new Audio.Sound();

        // Load move sound
        await moveSound.loadAsync(moveSoundFile);
        moveRef.current = moveSound;

        // Load capture sound
        await captureSound.loadAsync(captureSoundFile);
        captureRef.current = captureSound;
      } catch (error) {
        console.error('Error loading sounds:', error);
      }
    };

    loadSounds();

    return () => {
      // Unload sounds when component unmounts
      moveRef.current?.unloadAsync();
      captureRef.current?.unloadAsync();
    };
  }, []);

  // Create new AI game if needed
  useEffect(() => {
    const initializeGame = async () => {
      if (gameId && token) {
        setLoading(false);
        return;
      }

      try {
        // Use token from Redux if not provided in params
        const authToken = token || reduxToken;
        if (!authToken) {
          Alert.alert('Error', 'Authentication required');
          router.back();
          return;
        }

        setToken(authToken);

        // Create new AI game
        const response = await gameApi.startGame('ai');
        const newGameId = response.data.gameId;
        setGameId(newGameId);
        setLoading(false);
      } catch (error) {
        console.error('Error creating AI game:', error);
        Alert.alert('Error', 'Failed to create AI game');
        router.back();
      }
    };

    if (!gameId || !token) {
      initializeGame();
    }
  }, [gameId, token, reduxToken]);

  // Connect socket when component mounts
  useEffect(() => {
    if (!token || !gameId) return;

    const socket = connectSocket(token);

    // Listen for moves from backend (AI or opponent)
    socket.on(
      'move',
      ({ from, to, promotion }: { from: string; to: string; promotion?: string }) => {
        const move = chess.move({ from: from as Square, to: to as Square, promotion });
        if (move) {
          chessboardRef.current?.move({ from: from as Square, to: to as Square });
          setFen(chess.fen());
        }
      }
    );

    return () => {
      socket.off('move');
    };
  }, [token, gameId]);

  const playSound = async (type: 'move' | 'capture') => {
    try {
      const s = type === 'move' ? moveRef.current : captureRef.current;
      await s?.replayAsync();
    } catch (error) {
      console.error('error playing sound:', error);
    }
  };

  // Handle a player move
  const handleMove = async (info: ChessMoveInfo) => {
    if (!gameId || !token) return;

    const { from, to, promotion } = info.move;

    const moveRes = chess.move({ from: from as Square, to: to as Square, promotion });
    if (!moveRes) return;

    setFen(chess.fen());
    playSound(moveRes.captured ? 'capture' : 'move');

    try {
      // Send human move to backend
      // We need to use a direct fetch call here because gameApi.makeMove doesn't match the backend endpoint
      const res = await fetch(`${API_BASE_URL.apiBaseUrl}/games/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameId,
          playerId: 'HUMAN', // optional; backend can use token
          moveStr: `${from}${to}`,
          promotion: promotion || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert('Error', data.message || 'Move rejected by server');
        // Undo locally
        chess.undo();
        setFen(chess.fen());
        return;
      }

      // If AI move is returned from backend
      if (data?.aiMove) {
        const aiFrom = data.aiMove.slice(0, 2);
        const aiTo = data.aiMove.slice(2, 4);
        const aiPromotion = data.aiPromotion || undefined;

        const aiMoveRes = chess.move({
          from: aiFrom as Square,
          to: aiTo as Square,
          promotion: aiPromotion,
        });
        if (aiMoveRes) {
          chessboardRef.current?.move({ from: aiFrom as Square, to: aiTo as Square });
          setFen(chess.fen());
          playSound(aiMoveRes.captured ? 'capture' : 'move');
        }
      }
    } catch (err) {
      console.error('Error communicating with backend:', err);
      Alert.alert('Error', 'Could not connect to server.');
    }
  };

  // Undo move locally
  const handleUndo = () => {
    try {
      const undone = chess.undo();
      if (undone) setFen(chess.fen());
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch AI hints
  const handleHint = async () => {
    if (!gameId || !token) return;

    try {
      // The aiApi.getMoveSuggestion doesn't match the backend endpoint, so we use a direct fetch call
      const res = await fetch(`${API_BASE_URL.apiBaseUrl}/ai/suggest-moves`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gameId, playerId: 'HUMAN', suggestionsCount: 3, style: 'balanced' }),
      });

      const data = await res.json();
      Alert.alert('AI Suggestions', data.suggestions?.join(', ') || 'No suggestions');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not fetch hints.');
    }
  };

  const image = {
    uri: 'https://img.freepik.com/premium-photo/watercolor-teal-blue-green-background-painting-watercolor-dark-blue_145343-69.jpg?w=360',
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Setting up AI game...</Text>
      </View>
    );
  }

  return (
    <ImageBackground source={image} resizeMode="cover" style={styles.backgroundImage}>
      <View style={styles.screen}>
        {/* Board Area */}
        <View style={styles.container}>
          <Chessboard ref={chessboardRef} fen={fen} durations={{ move: 200 }} onMove={handleMove} />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable style={styles.button} onPress={() => chessboardRef.current?.resetBoard()}>
            <RotateCcwIcon size={32} color="white" />
            <Text style={styles.text}>Reset</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={handleHint}>
            <Lightbulb size={35} color="white" />
            <Text style={styles.text}>Hint</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={handleUndo}>
            <Undo2 size={32} color="white" />
            <Text style={styles.text}>Undo</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={() => router.back()}>
            <DoorOpenIcon size={32} color="white" />
            <Text style={styles.text}>Exit</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BackgroundColor,
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.white,
  },
  screen: { flex: 1 },
  backgroundImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 20 },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: COLORS.BackgroundColor,
    opacity: 0.5,
    borderTopWidth: 2,
    borderTopColor: COLORS.white + '40',
    marginBottom: 5,
  },
  button: { alignItems: 'center', paddingHorizontal: 16 },
  text: { fontSize: 16, color: COLORS.white, marginTop: 4, textAlign: 'center', fontWeight: '600' },
});
