import { COLORS } from '@/constants/colors';
import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import LoadingDots from 'react-native-loading-dots';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { io } from 'socket.io-client';

export default function WaitingScreen() {
  const image = {
    uri: 'https://img.freepik.com/premium-photo/watercolor-teal-blue-green-background-painting-watercolor-dark-blue_145343-69.jpg?w=360',
  };
  const socket = io(`${process.env.EXPO_PUBLIC_BE_PATH}`, {
    transports: ['websocket'],
    auth: {
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGFjNmU0NjBkNjk5YmMwYzc1ZWZhOTkiLCJuYW1lIjoiVXNlcl84YzJkOTkiLCJpYXQiOjE3NTYxMzA4ODYsImV4cCI6MTc1NjczNTY4Nn0.diiRJOHwiZJYFON79_3plMwhjQ2KhwWeZjL3xjFAENw',
    },
  });

  socket.on('connect', () => {
    console.log('Connected:', socket.id);
  });

  return (
    <SafeAreaProvider>
      <ImageBackground style={styles.backgroundImage} resizeMode="cover" source={image}>
        <View style={styles.screen}>
          <View style={styles.container}>
            <Text style={styles.text}>Waiting for other player</Text>
            <LoadingDots bounceHeight={15} />
          </View>
        </View>
      </ImageBackground>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginTop: 4,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
    color: COLORS.white,
  },
});
