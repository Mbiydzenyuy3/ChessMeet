// app/main/_layout.tsx
import React, { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getToken } from '@/lib/storage';

function TabHeader({ title }: { title: string }) {
  return (
    <View
      style={{
        padding: 12,
        borderBottomWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: 'white',
      }}
    >
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
    <Tabs
      screenOptions={{
        header: ({ options }) => <TabHeader title={String(options.title)} />,
        tabBarStyle: {
          backgroundColor: '#111827',
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
          title: 'Lobby',
          tabBarLabel: 'Lobby',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Statistiques',
          tabBarLabel: 'Stats',
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="game"
        options={{
          href: null, // 👈 ne s'affiche pas dans la tabbar
          title: 'Partie',
        }}
      />
      <Tabs.Screen
        name="PlayLocal"
        options={{
          href: null, // 👈 empêche expo-router de générer un onglet
          title: 'Play Local',
        }}
      />
    </Tabs>
  );
}
