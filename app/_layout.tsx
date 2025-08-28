// app/_layout.tsx
import SplashScreen from '@/components/SplashScreen';
import { AppDispatch, RootState, store } from '@/store';
import { hydrateAuth } from '@/store/authSlice';
import { Slot, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';

function AuthGate() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { token, loading } = useSelector((state: RootState) => state.auth);
  const [ready, setReady] = useState(false);

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
  }, [ready, loading, token]);

  if (!ready || loading) {
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
