import { COLORS } from '@/constants/colors';
import React, { useEffect } from 'react';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import the image for the transition screen
import logoImage from '../assets/images/threeheadpiece.png';
import transitionImage from '../assets/images/woodenbg.jpg';

interface TransitionScreenProps {
  onAnimationFinish: () => void;
}

export default function TransitionScreen({ onAnimationFinish }: TransitionScreenProps) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  // Animated style for the progress bar width
  const progressBarAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  // Animated style for the whole screen fade-in/out
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    // 1. Fade in the screen
    opacity.value = withTiming(1, { duration: 400 }, () => {
      // 2. Animate the progress bar
      progress.value = withTiming(1, { duration: 3500 }, () => {
        // 3. Once progress is full, fade out the screen
        opacity.value = withTiming(0, { duration: 400 }, () => {
          // 4. Call the callback function after fading out
          runOnJS(onAnimationFinish)();
        });
      });
    });
  }, [onAnimationFinish, progress, opacity]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={transitionImage} style={styles.background} resizeMode="cover">
        <View style={styles.overlay}>
          <Animated.View style={[styles.contentContainer, containerAnimatedStyle]}>
            <Image source={logoImage} style={styles.image} />

            <Text style={styles.loadingText}>LOADING...</Text>

            {/* Progress Bar */}
            <View style={styles.progressBarBackground}>
              <Animated.View style={[styles.progressBarForeground, progressBarAnimatedStyle]} />
            </View>
          </Animated.View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 148,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  background: { flex: 1, alignItems: 'center', justifyContent: 'flex-start' },
  loadingText: {
    color: COLORS.borderColor, // Gold color
    fontSize: 24,
    fontFamily: 'CinzelDecorative-Bold', // Using the gamer font
    marginTop: 20,
    letterSpacing: 3,
  },
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    width: '100%',
  },
  progressBarBackground: {
    height: 10,
    width: 250,
    backgroundColor: COLORS.progressBg,
    borderRadius: 5,
    marginTop: 20,
    overflow: 'hidden', // Ensures the foreground bar stays within the rounded corners
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  progressBarForeground: {
    height: '100%',
    backgroundColor: COLORS.borderColor, // Gold color
    borderRadius: 5,
  },
});
