import { Square } from 'chess.js';
import { Audio } from 'expo-av';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Chessboard, { ChessboardRef } from 'react-native-chessboard';
import captureSound from '../assets/sound/Capture.mp3';
import moveSound from '../assets/sound/Move.mp3';

export default function Board() {
  const chessboardRef = useRef<ChessboardRef>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

  const playSound = async (type: 'move' | 'capture') => {
    const sound = new Audio.Sound();
    try {
      const file = type === 'move' ? moveSound : captureSound;

      await sound.loadAsync(file);
      await sound.playAsync();
      sound.unloadAsync();
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
        //pllay
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

  return (
    <View style={styles.container}>
      <Chessboard
        // renderPiece=""
        ref={chessboardRef}
        durations={{ move: 200 }}
      />
      <View>{listenTap()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
