/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-native/no-color-literals */
// components/EnhancedChessboard.tsx
import React, { useEffect, useState, memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import Chessboard, { ChessboardRef } from 'react-native-chessboard';
import { Square } from 'chess.js';

const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 40, 400);
const SQUARE_SIZE = BOARD_SIZE / 8;

interface LastMove {
  from: Square;
  to: Square;
  san: string;
}

interface EnhancedChessboardProps {
  boardRef: React.RefObject<ChessboardRef | null>;
  fen: string;
  onMove: (info: any) => Promise<boolean>;
  colors: any;
  lastMove?: LastMove | null;
  playerColor: 'w' | 'b' | null;
  turn: 'w' | 'b';
}

const squareToPosition = (square: string, playerColor: 'w' | 'b' | null) => {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // Colonne de 0 à 7
  const rank = parseInt(square[1]) - 1; // Rangée de 0 à 7

  let x, y;

  if (playerColor === 'b') {
    x = (7 - file) * SQUARE_SIZE; // Inverse la colonne (e.g., a -> h)
    y = (7 - rank) * SQUARE_SIZE; // Inverse la rangée (e.g., 1 -> 8)
  } else {
    x = file * SQUARE_SIZE;
    y = (7 - rank) * SQUARE_SIZE;
  }

  return { x, y };
};

const MoveHighlight: React.FC<{
  square: string;
  type: 'from' | 'to';
  playerColor: 'w' | 'b' | null;
  visible: boolean;
}> = ({ square, type, playerColor, visible }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (visible) {
      opacity.value = withSequence(
        withTiming(0, { duration: 0 }),
        withDelay(100, withTiming(0.8, { duration: 400 })),
        withTiming(0.6, { duration: 1500 }),
        withTiming(0, { duration: 800 })
      );
      scale.value = withSequence(
        withTiming(0.8, { duration: 0 }),
        withTiming(1.2, { duration: 400 }),
        withTiming(1, { duration: 300 })
      );
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(0.8, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const position = squareToPosition(square, playerColor);
  const highlightColor = type === 'from' ? '#FF6B35' : '#4CAF50';

  return (
    <Animated.View
      style={[
        styles.moveHighlight,
        {
          left: position.x,
          top: position.y,
          backgroundColor: highlightColor,
        },
        animatedStyle,
      ]}
    />
  );
};

const EnhancedChessboard: React.FC<EnhancedChessboardProps> = ({
  boardRef,
  fen,
  onMove,
  colors,
  lastMove,
  playerColor,
}) => {
  const [showHighlight, setShowHighlight] = useState(false);

  useEffect(() => {
    if (lastMove) {
      setShowHighlight(true);
      const timer = setTimeout(() => {
        setShowHighlight(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastMove]);

  return (
    <View style={styles.container}>
      <View style={styles.boardWrapper}>
        <Chessboard ref={boardRef} fen={fen} onMove={onMove} colors={colors} />
        {lastMove && (
          <View style={styles.highlightOverlay}>
            <MoveHighlight
              square={lastMove.from}
              type="from"
              playerColor={playerColor}
              visible={showHighlight}
            />
            <MoveHighlight
              square={lastMove.to}
              type="to"
              playerColor={playerColor}
              visible={showHighlight}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardWrapper: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  highlightOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  moveHighlight: {
    position: 'absolute',
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    borderRadius: SQUARE_SIZE / 2,
    borderWidth: 3,
    borderColor: '#FFF',
  },
});

export default memo(EnhancedChessboard);
