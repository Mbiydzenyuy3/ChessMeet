import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Chessboard, { ChessboardRef } from 'react-native-chessboard';

export default function Board() {
  const chessboardRef = useRef<ChessboardRef>(null);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  //click logic
  const handlePress = useCallback(async (square: string) => {
    //first click select initial box
    if (!selectedSquare) {
      setSelectedSquare(square);
    } else {
      //second click to move
      const moveRes = await chessboardRef.current?.move({
        from: selectedSquare,
        to: square,
      });

      //reset move if it's illegal
      if (!moveRes) {
        setSelectedSquare(null);
        return;
      }

      //reset selected box
      setSelectedSquare(null);
    }
  }, []);

  //make all boxes listen for taps and handlepress function

  const listenTap = () => {
    const square = [];
    const box = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    for (let i = 8; i >= 8; i--) {
      for (let x = 0; x < 8; x++) {
        const squares = `${box[x]}${i}`;
        square.push(<Pressable key={squares} onPress={() => handlePress(squares)} />);
      }
    }

    return <View>{square}</View>;
  };

  return (
    <View style={styles.container}>
      <Chessboard ref={chessboardRef} durations={{ move: 1000 }} />
      <View style={styles.overlay} pointerEvents="auto">
        {listenTap()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
});
