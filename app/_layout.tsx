/* eslint-disable react-native/no-inline-styles */
import { AppDispatch, RootState, store } from '@/store';
import { hydrateAuth } from '@/store/authSlice';
import * as Font from 'expo-font';
import { Slot, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';

import SplashScreen from '@/components/SplashScreen';
import MidnightMinutes from '../assets/fonts/MidnightMinutes.ttf';
import MedievalSharp from '../assets/fonts/MedievalSharp-Regular.ttf';

function AuthGate() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { token, loading } = useSelector((state: RootState) => state.auth);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          MidnightMinutes,
          MedievalSharp,
        });
        await dispatch(hydrateAuth());
      } catch (e) {
        console.warn(e);
      } finally {
        setReady(true);
      }
    }
    prepare();
  }, [dispatch]);

  useEffect(() => {
    if (!ready || loading) return;

    const redirect = () => {
      if (token) {
        router.replace('/main');
      } else {
        router.replace('/auth');
      }
    };

    if (Platform.OS === 'web') {
      // Sur web → utiliser setTimeout pour laisser Slot se monter
      setTimeout(redirect, 0);
    } else {
      // Sur mobile → rediriger direct
      redirect();
    }
  }, [ready, loading, token]);

  if (!ready || loading) {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthGate />
    </Provider>
  );
}
