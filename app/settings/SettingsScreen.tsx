import { COLORS } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import type { RootStackParamList } from '@/types/navigation';
import { Ionicons } from '@expo/vector-icons'; // arrow icon
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function Settings({ navigation }: Props) {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.replace('Lobby')}>
        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        <Text style={styles.backText}>Back to Lobby</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Profile</Text>
      <View style={styles.profileContainer}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.displayName ?? 'Guest'}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email ?? 'Not set'}</Text>
      </View>

      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.preferenceContainer}>
        <Text style={styles.label}>Dark Mode</Text>
        <Switch
          value={darkMode}
          onValueChange={(value) => setDarkMode(value)}
          trackColor={{ false: '#767577', true: COLORS.bgMossGreen }}
          thumbColor={darkMode ? COLORS.white : '#f4f3f4'}
        />
      </View>

      <Text style={styles.sectionTitle}>Account</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.BackgroundColor,
    flexGrow: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    color: COLORS.white,
    fontSize: 16,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginVertical: 10,
  },
  profileContainer: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: COLORS.blacktext,
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.blacktext,
  },
  preferenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: COLORS.bgMossGreen,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
