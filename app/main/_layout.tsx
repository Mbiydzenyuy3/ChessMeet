/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
// app/main/_layout.tsx
import { Tabs, usePathname } from 'expo-router';
import { BarChart2, Home, User } from 'lucide-react-native';
import React from 'react';
import { Dimensions, ImageBackground, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import lobby from '../../assets/images/woodenbg.jpg';

const { width, height } = Dimensions.get('window');

export default function MainTabLayout() {
  // Get the current route path
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Define which screens should have the tab bar hidden
  const HIDDEN_PREFIXES = ['/main/game', '/main/PlayLocal', '/main/WaitingScreen'];
  const isTabHidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));
  // Define colors and sizes for icons
  const iconColor = '#9E9E9E';
  const focusedIconColor = '#FFF8E1'; // Use our theme's gold/cream color
  const iconSize = Platform.OS === 'ios' ? 28 : 24;

  return (
    <ImageBackground source={lobby} style={styles.background} resizeMode="cover">
      <Tabs
        screenOptions={{
          headerShown: false, // We use a custom header or no header in our themed screens
          tabBarActiveTintColor: focusedIconColor,
          tabBarInactiveTintColor: iconColor,
          tabBarStyle: {
            // Conditionally hide the tab bar based on the current screen
            display: isTabHidden ? 'none' : 'flex',
            backgroundColor: 'transparent', // Dark wood/card color from our theme
            borderTopWidth: 0,
            height: 60 + insets.bottom,
            elevation: 0,
            paddingBottom: insets.bottom,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Lobby',
            tabBarIcon: ({ color }) => <Home color={color} size={iconSize} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <User color={color} size={iconSize} />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            tabBarIcon: ({ color }) => <BarChart2 color={color} size={iconSize} />,
          }}
        />
        {/* The following screens are part of the layout but are not visible in the tab bar.
        This allows us to navigate to them while still being part of this 'main' group.
      */}
        <Tabs.Screen
          name="game"
          options={{
            href: null, // Hides this screen from the tab bar
          }}
        />
        <Tabs.Screen
          name="matchmakin"
          options={{
            href: null, // Hides this screen from the tab bar
          }}
        />
        <Tabs.Screen
          name="PlayLocal"
          options={{
            href: null, // Hides this screen from the tab bar
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
});
