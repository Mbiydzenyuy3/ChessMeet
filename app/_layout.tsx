// app/_layout.tsx
import SplashScreen from '@/components/SplashScreen';
import { AppDispatch, RootState, store } from '@/store';
import { hydrateAuth } from '@/store/authSlice';
import * as Font from 'expo-font';
import { Slot, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import MedievalSharp from '../assets/fonts/MedievalSharp-Regular.ttf';
import MidnightMinutes from '../assets/fonts/MidnightMinutes.ttf';

function AuthGate() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { token, loading } = useSelector((state: RootState) => state.auth);
  const [ready, setReady] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load fonts asynchronously
  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        MidnightMinutes: MidnightMinutes,
        MedievalSharp: MedievalSharp,
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  // hydrate Redux
  useEffect(() => {
    dispatch(hydrateAuth()).finally(() => {
      setReady(true);
    });
  }, [dispatch]);

  // rediriger SEULEMENT après le premier render
  useEffect(() => {
    if (!ready || loading) return;

    // ⚠️ Utiliser setTimeout pour laisser RootLayout + Slot se monter
    setTimeout(() => {
      if (token) {
        router.replace('/main');
      } else {
        router.replace('/auth');
      }
    }, 0);
  }, [ready, loading, token, fontsLoaded]);

  if (!ready || loading || !fontsLoaded) {
    return <SplashScreen />;
  }

  // Toujours rendre un Slot (même si on redirige juste après)
  return <Slot />;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthGate />
    </Provider>
  );
}
