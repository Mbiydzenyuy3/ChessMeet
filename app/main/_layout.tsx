/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
// app/main/_layout.tsx
import { Tabs, usePathname } from 'expo-router';
import { BarChart2, Home } from 'lucide-react-native';
import React from 'react';
import { Dimensions, ImageBackground, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import lobby from '../../assets/images/woodenbg.jpg';

const BRAND_COLOR = '#D4AF37';

// Define a type for the icon component to satisfy TypeScript
type TabBarIconProps = {
  focused: boolean;
  color: string;
  size: number;
};
type IconComponentType = React.FC<{ color: string; size: number }>;

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
  const focusedIconColor = BRAND_COLOR; // Use our theme's gold/cream color
  const iconSize = Platform.OS === 'ios' ? 28 : 24;

  // Add explicit types for the parameters
  const renderTabBarIcon = (
    IconComponent: IconComponentType,
    { focused, color, size }: TabBarIconProps
  ) => {
    return (
      <View style={styles.iconContainer}>
        {focused && <View style={styles.focusedIndicator} />}
        <IconComponent color={color} size={size} />
      </View>
    );
  };

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
            tabBarIcon: (props) => renderTabBarIcon(Home, { ...props, size: iconSize }),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: (props) => renderTabBarIcon(BarChart2, { ...props, size: iconSize }),
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
  },
  focusedIndicator: {
    position: 'absolute',
    top: 0,
    width: '50%',
    height: 3,
    backgroundColor: BRAND_COLOR,
    borderRadius: 2,
  },
  iconContainer: {
    width: 60,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
