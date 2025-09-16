/* eslint-disable react-native/no-color-literals */
// components/PlayerCard.tsx
import React, { useEffect, memo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

// Import image assets directly
import RobotAvatar from '../../assets/images/avatar.png';
import DefaultAvatar from '../../assets/images/default.png';

interface PlayerCardProps {
  player: {
    _id: string;
    displayName: string;
    avatar?: string;
    rating?: number | null;
    isAI?: boolean;
  };
  isActive: boolean;
  lastMove?: string;
  isCurrentPlayer: boolean;
  position: 'top' | 'bottom';
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isActive,
  lastMove,
  isCurrentPlayer,
  position,
}) => {
  const glowOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const moveIndicatorOpacity = useSharedValue(0);

  console.log(
    `information de l'utilisateur position:${position} ${JSON.stringify(player)} isActive:${isActive} lastMove:${lastMove}`
  );

  useEffect(() => {
    if (isActive) {
      glowOpacity.value = withRepeat(
        withSequence(withTiming(1, { duration: 1000 }), withTiming(0.3, { duration: 1000 })),
        -1,
        true
      );
      pulseScale.value = withRepeat(
        withSequence(withTiming(1.02, { duration: 1000 }), withTiming(1, { duration: 1000 })),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 500 });
      pulseScale.value = withTiming(1, { duration: 500 });
    }
  }, [isActive]);

  useEffect(() => {
    if (lastMove && !isCurrentPlayer) {
      moveIndicatorOpacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.7, { duration: 2000 }),
        withTiming(0, { duration: 500 })
      );
    }
  }, [lastMove, isCurrentPlayer]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  const moveIndicatorStyle = useAnimatedStyle(() => ({
    opacity: moveIndicatorOpacity.value,
  }));

  const getAvatarSource = () => {
    if (player.isAI) {
      return RobotAvatar;
    }
    if (player.avatar) {
      return { uri: player.avatar };
    }
    return DefaultAvatar;
  };

  return (
    <View style={[styles.container, position === 'top' ? styles.topCard : styles.bottomCard]}>
      <Animated.View style={[styles.glowBackdrop, glowStyle]} />
      <View style={[styles.card, isActive && styles.activeCard]}>
        <View style={styles.avatarContainer}>
          <Image source={getAvatarSource()} style={styles.avatar} />
          {player.isAI && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
          )}
        </View>

        <View style={styles.playerInfo}>
          <Text style={styles.playerName} numberOfLines={1}>
            {player.displayName}
          </Text>
          <Text style={styles.playerRating}>
            {player.rating ? `${player.rating} ELO` : 'Unrated'}
          </Text>
        </View>

        {isActive && (
          <View style={styles.turnIndicator}>
            <Text style={styles.turnText}>Your Turn</Text>
          </View>
        )}

        {lastMove && !isCurrentPlayer && (
          <Animated.View style={[styles.moveIndicator, moveIndicatorStyle]}>
            <Text style={styles.moveText}>{lastMove}</Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
  },
  topCard: {
    top: 60,
  },
  bottomCard: {
    bottom: 120,
  },
  glowBackdrop: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 16,
    backgroundColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 45, 0.95)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeCard: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(30, 30, 45, 1)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  aiBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  aiBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: '#FFF8E1',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  playerRating: {
    color: '#D4AF37',
    fontSize: 12,
    opacity: 0.8,
  },
  turnIndicator: {
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  turnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  moveIndicator: {
    backgroundColor: 'rgba(255, 107, 53, 0.9)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  moveText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default memo(PlayerCard);
