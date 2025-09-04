// /* eslint-disable react-native/no-color-literals */
// /* eslint-disable react-native/no-inline-styles */
// // app/main/_layout.tsx
// import { COLORS } from '@/constants/colors';
// import { getToken } from '@/lib/storage';
// import { Ionicons } from '@expo/vector-icons';
// import { Tabs, useRouter } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import {
//   ActivityIndicator,
//   Dimensions,
//   ImageBackground,
//   StyleSheet,
//   Text,
//   View,
// } from 'react-native';
// import lobby from '../../assets/images/woodenbg.jpg';

// const { width, height } = Dimensions.get('window');

// function TabHeader({ title }: { title: string }) {
//   return (
//     <View style={styles.view}>
//       <Text style={{ fontSize: 18, fontWeight: '700' }}>{title}</Text>
//     </View>
//   );
// }

// export default function Layout() {
//   const router = useRouter();
//   const [checking, setChecking] = useState(true);
//   // Vérification du token dès le montage
//   useEffect(() => {
//     const checkAuth = async () => {
//       const token = await getToken();
//       if (!token) {
//         router.replace('/auth');
//       } else {
//         setChecking(false);
//       }
//     };
//     checkAuth();
//   }, []);

//   // ⏳ Pendant la vérification → afficher loader
//   if (checking) {
//     return (
//       // eslint-disable-next-line react-native/no-inline-styles
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" color="#10b981" />
//         <Text style={{ marginTop: 10 }}>Checking session...</Text>
//       </View>
//     );
//   }

//   return (
//     <ImageBackground
//       source={lobby} // ✅ wooden background
//       style={styles.background}
//       resizeMode="cover"
//     >
//       <Tabs
//         screenOptions={{
//           header: ({ options }) => <TabHeader title={String(options.title)} />,
//           tabBarStyle: {
//             backgroundColor: 'Color',
//             borderTopWidth: 0,
//             height: 60,
//           },
//           tabBarActiveTintColor: '#10b981',
//           tabBarInactiveTintColor: '#9ca3af',
//           tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
//         }}
//       >
//         <Tabs.Screen
//           name="index"
//           options={{
//             title: '',
//             tabBarLabel: 'Lobby',
//             tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
//           }}
//         />
//         <Tabs.Screen
//           name="profile"
//           options={{
//             title: '',
//             tabBarLabel: 'Profil',
//             tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
//           }}
//         />
//         <Tabs.Screen
//           name="stats"
//           options={{
//             title: '',
//             tabBarLabel: 'Stats',
//             tabBarIcon: ({ color, size }) => (
//               <Ionicons name="bar-chart" color={color} size={size} />
//             ),
//           }}
//         />
//         <Tabs.Screen
//           name="game"
//           options={{
//             href: null, // 👈 ne s'affiche pas dans la tabbar
//             title: '',
//           }}
//         />
//         <Tabs.Screen
//           name="PlayLocal"
//           options={{
//             href: null, // 👈 empêche expo-router de générer un onglet
//             title: '',
//           }}
//         />
//       </Tabs>
//     </ImageBackground>
//   );
// }

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     width,
//     height,
//     // justifyContent: 'center',
//     // alignItems: 'center',
//   },
//   //

//   view: {
//     // padding: 12,
//     borderBottomWidth: 1,
//     // borderColor: COLORS.border,
//     backgroundColor: COLORS.BackgroundColor,
//   },
// });

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
  const HIDDEN_ROUTES = new Set(['/main/game', '/main/PlayLocal', '/main/WaitingScreen']);
  const isTabHidden = HIDDEN_ROUTES.has(pathname);
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
            height: 60 + (Platform.OS === 'ios' ? insets.bottom : 0),
            elevation: 0,
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : 5,
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
