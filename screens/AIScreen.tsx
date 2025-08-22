import { COLORS } from '@/constants/colors';
import { Chess, Square } from 'chess.js';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { DoorOpenIcon, Lightbulb, RotateCcwIcon, Undo2 } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import Chessboard, { ChessboardRef } from 'react-native-chessboard';
import captureSound from '../assets/sound/Capture.mp3';
import moveSound from '../assets/sound/Move.mp3';

const router = useRouter();

export default function Board() {
  const chessboardRef = useRef<ChessboardRef>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const chess = useRef(new Chess()).current;
  const [fen, setFen] = useState(chess.fen());
  const moveRef = useRef<Audio.Sound | null>(null);
  const captureRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const [m, c] = [new Audio.Sound(), new Audio.Sound()];
      await m.loadAsync(moveSound);
      await c.loadAsync(captureSound);
      if (mounted) {
        moveRef.current = m;
        captureRef.current = c;
      } else {
        await m.unloadAsync();
        await c.unloadAsync();
      }
    })();
    return () => {
      mounted = false;
      moveRef.current?.unloadAsync();
      captureRef.current?.unloadAsync();
    };
  }, []);
  const playSound = async (type: 'move' | 'capture') => {
    try {
      const s = type === 'move' ? moveRef.current : captureRef.current;
      await s?.replayAsync();
    } catch (error) {
      console.error('error playing sound:', error);
    }
  };

  const handlePress = useCallback(
    async (box: Square) => {
      if (!selectedSquare) {
        setSelectedSquare(box);
      } else {
        const moveRes = await chessboardRef.current?.move({
          from: selectedSquare,
          to: box,
        });

        if (!moveRes) {
          setSelectedSquare(null);
          return;
        }

        setFen(chess.fen());

        // play sounds
        if (moveRes.captured) {
          playSound('capture');
        } else {
          playSound('move');
        }

        setSelectedSquare(null);
      }
    },
    [selectedSquare]
  );

  const listenTap = () => {
    const squareList = [];
    const file = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    for (let i = 8; i >= 1; i--) {
      for (let x = 0; x < 8; x++) {
        const square = `${file[x]}${i}` as Square;
        squareList.push(<Pressable key={square} onPress={() => handlePress(square)} />);
      }
    }

    return squareList;
  };

  const handleUndo = () => {
    try {
      const undone = chess.undo();
      if (undone) {
        setFen(chess.fen());
      }
    } catch (error) {
      console.error(error);
    }
  };
  const image = {
    uri: 'https://img.freepik.com/premium-photo/watercolor-teal-blue-green-background-painting-watercolor-dark-blue_145343-69.jpg?w=360',
  };
  return (
    <ImageBackground source={image} resizeMode="cover" style={styles.backgroundImage}>
      <View style={styles.screen}>
        {/* Board Area */}
        <View style={styles.container}>
          <Chessboard ref={chessboardRef} durations={{ move: 200 }} fen={fen} />
          <View>{listenTap()}</View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable style={styles.button} onPress={() => chessboardRef.current?.resetBoard()}>
            <RotateCcwIcon size={32} color="white" />
            <Text style={styles.text}>Reset</Text>
          </Pressable>

          <Pressable>
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
  screen: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },

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
  button: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
    color: COLORS.white,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
});
