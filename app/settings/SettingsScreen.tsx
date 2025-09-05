import { COLORS } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
// import { clearToken } from '@/lib/storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// Use the same wooden background for consistency
import { useAudioPlayer } from 'expo-audio';
import lobby from '../../assets/images/woodenbg.jpg';
import clickSound from '../../assets/sound/click.mp3';

export default function SettingsScreen() {
  const click = useAudioPlayer(clickSound);
  const { user } = useAuth();
  const [isSoundEnabled, setIsSoundEnabled] = useState(true); // State for sound toggle
  const [isDarkMode, setIsDarkMode] = useState(true); // State for dark mode toggle
  const router = useRouter();

  return (
    <ImageBackground source={lobby} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Settings</Text>

          {/* Profile Section */}
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{user?.displayName ?? 'Guest'}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.row}>
              <Text style={styles.label}>Avatar</Text>
              <Text style={styles.value}>{user?.avatarUrl}</Text>
            </View>
          </View>

          {/* Preferences Section */}
          <Text style={styles.sectionTitle}>Game Preferences</Text>
          <View style={styles.card}>
            {/* Dark Mode Toggle */}
            <View style={styles.row}>
              <Text style={styles.label}>Dark Mode</Text>
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                trackColor={{ false: '#767577', true: '#D4AF37' }} // Gold track
                thumbColor={isDarkMode ? '#FFF8E1' : '#f4f3f4'}
              />
            </View>
            <View style={styles.separator} />
            {/* Sound Toggle */}
            <View style={styles.row}>
              <Text style={styles.label}>Game Sounds</Text>
              <Switch
                value={isSoundEnabled}
                onValueChange={setIsSoundEnabled}
                trackColor={{ false: '#767577', true: '#D4AF37' }} // Gold track
                thumbColor={isSoundEnabled ? '#FFF8E1' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Account Section */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity>
              <Text style={styles.actionButtonText}>Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.backButton]}
              onPress={() => {
                click.play();
                router.push('/main');
              }}
            >
              <Text style={styles.actionButtonText}>Back to Lobby</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

// ✅ NEW Styles for the wooden, game-like UI
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontFamily: 'CinzelDecorative-Bold',
    fontSize: 34,
    color: COLORS.buttonText,
    marginBottom: 25,
    textAlign: 'center',
    textShadowColor: COLORS.otpInput,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.borderColor, // Gold color for section titles
    marginVertical: 15,
    paddingLeft: 5,
  },
  card: {
    backgroundColor: COLORS.otpInput, // Dark wood card background
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderWidth,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  label: {
    fontSize: 16,
    color: COLORS.sub,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.whiteEmail,
    maxWidth: '60%',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderWidth,
  },
  buttonContainer: {
    marginTop: 'auto', // Pushes buttons to the bottom
    paddingTop: 30,
  },
  actionButton: {
    backgroundColor: COLORS.buttonOtp,
    borderWidth: 2,
    borderColor: COLORS.borderColor,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  actionButtonText: {
    color: COLORS.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: COLORS.transparentBorder,
    borderColor: COLORS.buttonOtp,
  },
});
