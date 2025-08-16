import { Square } from 'chess.js';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Chessboard, { ChessboardRef } from 'react-native-chessboard';

export default function Board() {
  const chessboardRef = useRef<ChessboardRef>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

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

        setSelectedSquare(null);
      }
    },
    [selectedSquare]
  );

  const listenTap = () => {
    const square = [];
    const box = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    for (let i = 8; i >= 1; i--) {
      for (let x = 0; x < 8; x++) {
        const squares = `${box[x]}${i}` as Square;
        square.push(
          <Pressable
            key={squares}
            onPress={() => handlePress(squares)}
            style={styles.overlaySquare}
          />
        );
      }
    }

    return square;
  };

  return (
    <View style={styles.container}>
      <Chessboard ref={chessboardRef} durations={{ move: 1000 }} />
      <View style={styles.overlay}>{listenTap()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    zIndex: 1,
  },
  overlaySquare: {
    width: `${100 / 8}%`,
    height: `${100 / 8}%`,
  },
});
