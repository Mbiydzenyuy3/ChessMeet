import { COLORS } from '@/constants/colors';
import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface FloatingPieceProps {
  symbol: string;
  index: number;
}

export default function FloatingPiece({ symbol, index }: FloatingPieceProps) {
  // Hooks are now correctly at the top level of this component
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.1);

  useEffect(() => {
    const delay = index * 300;
    translateY.value = withRepeat(
      withSequence(
        withDelay(delay, withTiming(-20, { duration: 3000 })),
        withTiming(20, { duration: 3000 })
      ),
      -1,
      true
    );
  }, [translateY, index]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  return (
    <AnimatedText
      style={[
        styles.floatingPiece,
        {
          left: `${10 + index * 15}%`,
          top: `${20 + (index % 2) * 40}%`,
        },
        animatedStyle,
      ]}
    >
      {symbol}
    </AnimatedText>
  );
}

const styles = StyleSheet.create({
  floatingPiece: {
    position: 'absolute',
    fontSize: 48,
    color: COLORS.white, // Using a direct color for simplicity
    opacity: 0.08,
  },
});
