/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useSocket } from '../../hooks/useSocket';
import { useAppDispatch } from '../../store';
import { updateFromGameObject, setLoading, setMode } from '../../store/gameSlice';
import { useRouter } from 'expo-router';

export default function MatchmakingWaitingScreen() {
  const socket = useSocket();
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    // Si le composant s'affiche, on est en état de chargement pour le matchmaking
    dispatch(setLoading(true));

    const onMatchFound = (data: any) => {
      console.log('Match trouvé !', data);
      if (data && data._id) {
        dispatch(setLoading(false)); // On désactive le loading
        dispatch(updateFromGameObject(data));
        router.replace('/main/game');
      }
    };

    const onTimeout = (data: any) => {
      console.log('Timeout, IA fallback');
      dispatch(setLoading(false));
      dispatch(setMode('ai'));
      dispatch(updateFromGameObject(data));
      router.replace('/main/game');
    };

    // On écoute l'événement 'matchFound' qui vient du backend
    socket.on('matchFound', onMatchFound);

    socket.on('waiting', (data: any) => {
      console.log(`message waiting ${data?.message}`);
    });

    // On écoute aussi le fallback IA
    socket.on('aiMatchFound', onTimeout);

    return () => {
      // Nettoyage des listeners
      socket.off('matchFound', onMatchFound);
      socket.off('aiMatchFound', onTimeout);
    };
  }, [socket, dispatch, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.text}>Recherche d un adversaire...</Text>
      <Text style={styles.subtext}>Ou en attente dun match IA si lattente est trop longue.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E2D',
  },
  text: {
    color: '#D4AF37',
    fontSize: 20,
    marginTop: 20,
  },
  subtext: {
    color: '#a0a0a0',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    marginHorizontal: 20,
  },
});
