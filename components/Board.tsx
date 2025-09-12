/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
// app/main/_layout.tsx
import { COLORS } from '@/constants/colors';
import { Chess, Square } from 'chess.js';
import { useAudioPlayer } from 'expo-audio';
import { useRouter } from 'expo-router';
import { DoorOpenIcon, RotateCcwIcon } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import Chessboard, { ChessboardRef } from 'react-native-chessboard';
import image from '../assets/images/woodenbg.jpg';
import captureSound from '../assets/sound/capture.mp3';
import moveSound from '../assets/sound/move-self.mp3';

const router = useRouter();

export default function Board() {
  const chessboardRef = useRef<ChessboardRef>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const chess = useRef(new Chess()).current;
  const [fen, setFen] = useState(chess.fen());

  // const playSound = async (type: 'move' | 'capture') => {
  //   const sound = new Audio.Sound();
  //   try {
  //     const file = type === 'move' ? moveSound : captureSound;
  //     await sound.loadAsync(file);
  //     await sound.playAsync();
  //     sound.unloadAsync();
  //   } catch (error) {
  //     console.error('error playing sound:', error);
  //   }
  // };

  const movePlayer = useAudioPlayer(moveSound);
  const capPlayer = useAudioPlayer(captureSound);

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
          // playSound('capture');
          capPlayer.play();
        } else {
          // playSound('move');
          movePlayer.play();
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

  // const handleUndo = () => {
  //   try {
  //     const undone = chess.undo();
  //     if (undone) {
  //       setFen(chess.fen());
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const boardColor = {
    black: '#481f01',
    white: '#eeeed2',
    lastMoveHighlight: 'rgba(255, 255, 0, 0.5)',
    checkmateHighlight: '#E84855',
    promotionPieceButton: '#FF9B71',
  };

  return (
    <ImageBackground source={image} resizeMode="cover" style={styles.backgroundImage}>
      <View style={styles.overlay}>
        <View style={styles.screen}>
          {/* Board Area */}
          <View style={styles.container}>
            <Chessboard
              ref={chessboardRef}
              durations={{ move: 200 }}
              fen={fen}
              colors={boardColor}
            />
            <View>{listenTap()}</View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <Pressable style={styles.button} onPress={() => chessboardRef.current?.resetBoard()}>
              <RotateCcwIcon size={32} color="white" />
              <Text style={styles.text}>Reset</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={() => router.back()}>
              <DoorOpenIcon size={32} color="white" />
              <Text style={styles.text}>Exit</Text>
            </Pressable>
          </View>
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
});
