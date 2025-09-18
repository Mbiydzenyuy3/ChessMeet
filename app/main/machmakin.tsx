/* eslint-disable react-native/no-raw-text */
/* eslint-disable react-native/no-color-literals */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useEffect } from 'react';
// import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
// import { useSocket } from '../../hooks/useSocket';
// import { useAppDispatch } from '../../store';
// import { updateFromGameObject, setLoading, setMode } from '../../store/gameSlice';
// import { useRouter } from 'expo-router';

// export default function MatchmakingWaitingScreen() {
//   const socket = useSocket();
//   const dispatch = useAppDispatch();
//   const router = useRouter();

//   useEffect(() => {
//     // Si le composant s'affiche, on est en état de chargement pour le matchmaking
//     dispatch(setLoading(true));

//     const onMatchFound = (data: any) => {
//       console.log('Match trouvé !', data);
//       if (data && data._id) {
//         dispatch(setLoading(false)); // On désactive le loading
//         dispatch(updateFromGameObject(data));
//         router.replace('/main/game');
//       }
//     };

//     const onTimeout = (data: any) => {
//       console.log('Timeout, IA fallback');
//       dispatch(setLoading(false));
//       dispatch(setMode('ai'));
//       dispatch(updateFromGameObject(data));
//       router.replace('/main/game');
//     };

//     // On écoute l'événement 'matchFound' qui vient du backend
//     socket.on('matchFound', onMatchFound);

//     socket.on('waiting', (data: any) => {
//       console.log(`message waiting ${data?.message}`);
//     });

//     // On écoute aussi le fallback IA
//     socket.on('aiMatchFound', onTimeout);

//     return () => {
//       // Nettoyage des listeners
//       socket.off('matchFound', onMatchFound);
//       socket.off('aiMatchFound', onTimeout);
//     };
//   }, [socket, dispatch, router]);

//   return (
//     <View style={styles.container}>
//       <ActivityIndicator size="large" color="#fff" />
//       <Text style={styles.text}>Recherche d un adversaire...</Text>
//       <Text style={styles.subtext}>Ou en attente dun match IA si lattente est trop longue.</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#1E1E2D',
//   },
//   text: {
//     color: '#D4AF37',
//     fontSize: 20,
//     marginTop: 20,
//   },
//   subtext: {
//     color: '#a0a0a0',
//     fontSize: 14,
//     marginTop: 10,
//     textAlign: 'center',
//     marginHorizontal: 20,
//   },
// });

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import lobby from '../../assets/images/woodenbg.jpg';
import { useSocket } from '../../hooks/useSocket';
import { useAppDispatch } from '../../store';
import { setLoading, setMode, updateFromGameObject } from '../../store/gameSlice';

const { width } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

// Composant pour les pièces d'échecs qui bougent
const MovingChessPiece = ({
  piece,
  index,
  delay,
}: {
  piece: string;
  index: number;
  delay: number;
}) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0.1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(-30, { duration: 2000 }), withTiming(30, { duration: 2000 })),
        -1,
        true
      )
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(-20, { duration: 3000 }), withTiming(20, { duration: 3000 })),
        -1,
        true
      )
    );

    rotation.value = withRepeat(withTiming(360, { duration: 8000 }), -1);

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(0.6, { duration: 1500 }), withTiming(0.2, { duration: 1500 })),
        -1,
        true
      )
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <AnimatedText
      style={[
        styles.floatingPiece,
        {
          left: `${10 + (index % 3) * 30}%`,
          top: `${20 + Math.floor(index / 3) * 25}%`,
        },
        animatedStyle,
      ]}
    >
      {piece}
    </AnimatedText>
  );
};

// Composant pour l'indicateur de progression
const ProgressIndicator = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 2000 }), -1);
  }, []);

  const progressStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 0.5, 1], [20, width * 0.8, 20], Extrapolation.CLAMP),
  }));

  return (
    <View style={styles.progressContainer}>
      <AnimatedView style={[styles.progressBar, progressStyle]} />
    </View>
  );
};

// Composant pour les points animés
const AnimatedDots = () => {
  const dots = [0, 1, 2];

  return (
    <View style={styles.dotsContainer}>
      {dots.map((index) => {
        const scale = useSharedValue(1);

        React.useEffect(() => {
          scale.value = withDelay(
            index * 300,
            withRepeat(
              withSequence(withTiming(1.3, { duration: 400 }), withTiming(1, { duration: 400 })),
              -1
            )
          );
        }, []);

        const dotStyle = useAnimatedStyle(() => ({
          transform: [{ scale: scale.value }],
        }));

        return <AnimatedView key={index} style={[styles.dot, dotStyle]} />;
      })}
    </View>
  );
};

export default function MatchmakingWaitingScreen() {
  const socket = useSocket();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [waitingTime, setWaitingTime] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Search for an opponent...');

  // Animation du titre principal
  const titleScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    titleScale.value = withSequence(
      withTiming(1.2, { duration: 600 }),
      withTiming(1, { duration: 400 })
    );
    titleOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
    opacity: titleOpacity.value,
  }));

  useEffect(() => {
    dispatch(setLoading(true));

    // Timer pour afficher le temps d'attente
    const timer = setInterval(() => {
      setWaitingTime((prev) => {
        const newTime = prev + 1;

        // Changer le message selon le temps d'attente
        if (newTime === 10) {
          setStatusMessage('Extended search...');
        } else if (newTime === 20) {
          setStatusMessage('Looking for opponents of all levels...');
        } else if (newTime === 30) {
          setStatusMessage('Preparing for a match against AI...');
        }

        return newTime;
      });
    }, 1000);

    const onMatchFound = (data: any) => {
      console.log('Match trouvé !', data);
      if (data && data._id) {
        dispatch(setLoading(false));
        dispatch(updateFromGameObject(data));
        clearInterval(timer);
        router.replace('/main/game');
      }
    };

    const onTimeout = (data: any) => {
      console.log('Timeout, IA fallback');
      dispatch(setLoading(false));
      dispatch(setMode('ai'));
      dispatch(updateFromGameObject(data));
      clearInterval(timer);
      router.replace('/main/game');
    };

    const onWaiting = (data: any) => {
      console.log(`Message d'attente: ${data?.message}`);
      setStatusMessage(data?.message || 'Search again...');
    };

    // Écouter les événements socket
    socket.on('matchFound', onMatchFound);
    socket.on('waiting', onWaiting);
    socket.on('aiMatchFound', onTimeout);

    return () => {
      socket.off('matchFound', onMatchFound);
      socket.off('aiMatchFound', onTimeout);
      socket.off('waiting', onWaiting);
      clearInterval(timer);
    };
  }, [socket, dispatch, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const chessPieces = ['♔', '♕', '♖', '♗', '♘', '♙'];

  return (
    <ImageBackground source={lobby} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        {/* Bouton retour */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            socket.emit('leaveQueue');
            router.replace('/main');
          }}
        >
          <ArrowLeft size={28} color={'#FFF8E1'} />
        </TouchableOpacity>

        {/* Pièces flottantes en arrière-plan */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {chessPieces.map((piece, index) => (
            <MovingChessPiece key={index} piece={piece} index={index} delay={index * 500} />
          ))}
        </View>

        <View style={styles.container}>
          {/* Titre principal */}
          <AnimatedText style={[styles.title, titleStyle]}>MATCHMAKING</AnimatedText>

          {/* Spinner principal */}
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <View style={styles.spinnerRing} />
          </View>

          {/* Message de statut */}
          <Text style={styles.statusText}>{statusMessage}</Text>

          {/* Barre de progression */}
          <ProgressIndicator />

          {/* Temps d'attente */}
          <View style={styles.timeContainer}>
            <Text style={styles.timeLabel}>Waiting time</Text>
            <Text style={styles.timeValue}>{formatTime(waitingTime)}</Text>
          </View>

          {/* Points animés */}
          <AnimatedDots />

          {/* Conseils d'attente */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 While waiting</Text>
            <Text style={styles.tipsText}>
              {waitingTime < 15
                ? 'We are looking for an opponent of your level'
                : waitingTime < 30
                  ? 'Expanding research at all levels'
                  : 'Preparing for a match against our advanced AI'}
            </Text>
          </View>

          {/* Bouton d'annulation */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              socket.emit('leaveQueue');
              router.replace('/main');
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel Search</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 12,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 25,
  },
  title: {
    fontFamily: 'CinzelDecorative-Bold',
    fontSize: 32,
    color: '#FFF8E1',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 2,
  },
  spinnerContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  spinnerRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    top: -10,
    left: -10,
  },
  statusText: {
    color: '#D4AF37',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '600',
  },
  progressContainer: {
    width: width * 0.8,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: 30,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 2,
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timeLabel: {
    color: '#E0E0E0',
    fontSize: 14,
    marginBottom: 5,
  },
  timeValue: {
    color: '#FFF8E1',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'CinzelDecorative-Bold',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D4AF37',
  },
  tipsContainer: {
    backgroundColor: 'rgba(30, 30, 45, 0.8)',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    marginBottom: 30,
    width: '100%',
  },
  tipsTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  tipsText: {
    color: '#E0E0E0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  cancelButton: {
    backgroundColor: 'rgba(196, 51, 51, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cancelButtonText: {
    color: '#FFF8E1',
    fontSize: 16,
    fontWeight: '600',
  },
  floatingPiece: {
    position: 'absolute',
    fontSize: 40,
    color: '#FFF8E1',
  },
});
