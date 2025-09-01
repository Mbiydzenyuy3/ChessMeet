// app/main/_layout.tsx
import { COLORS } from '@/constants/colors';
import { getToken } from '@/lib/storage';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import lobby from '../../assets/images/woodenbg.jpg';

const { width, height } = Dimensions.get('window');

function TabHeader({ title }: { title: string }) {
  return (
    <View style={styles.view}>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>{title}</Text>
    </View>
  );
}

export default function Layout() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  // Vérification du token dès le montage
  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      if (!token) {
        router.replace('/auth');
      } else {
        setChecking(false);
      }
    };
    checkAuth();
  }, []);

  // ⏳ Pendant la vérification → afficher loader
  if (checking) {
    return (
      // eslint-disable-next-line react-native/no-inline-styles
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={{ marginTop: 10 }}>Checking session...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={lobby} // ✅ wooden background
      style={styles.background}
      resizeMode="cover"
    >
      <Tabs
        screenOptions={{
          header: ({ options }) => <TabHeader title={String(options.title)} />,
          tabBarStyle: {
            backgroundColor: 'Color',
            borderTopWidth: 0,
            height: 60,
          },
          tabBarActiveTintColor: '#10b981',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: '',
            tabBarLabel: 'Lobby',
            tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: '',
            tabBarLabel: 'Profil',
            tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: '',
            tabBarLabel: 'Stats',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bar-chart" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="game"
          options={{
            href: null, // 👈 ne s'affiche pas dans la tabbar
            title: '',
          }}
        />
        <Tabs.Screen
          name="PlayLocal"
          options={{
            href: null, // 👈 empêche expo-router de générer un onglet
            title: '',
          }}
        />
      </Tabs>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)', // stronger cinematic overlay
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 32,
  },
  view: {
    // padding: 12,
    borderBottomWidth: 1,
    // borderColor: COLORS.border,
    backgroundColor: COLORS.BackgroundColor,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.whitetext,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 2,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.85,
  },
  ctaButton: {
    backgroundColor: COLORS.bgMossGreen,
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
    elevation: 6,
    shadowColor: COLORS.bgMossGreen,
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  ctaText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
