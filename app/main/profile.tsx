import { COLORS } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { clearToken } from '@/lib/storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

export default function Profile() {
  const { user, updateProfile, loading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? '');
      setAvatarUrl(user.avatarUrl ?? '');
    }
  }, [user]);

  const handleLogout = async () => {
    await clearToken();
    router.push('/auth/SignIn');
  };

  const handleSave = async () => {
    try {
      await updateProfile({ displayName, avatarUrl }).unwrap();
      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <Image
        source={{
          uri:
            user?.avatarUrl ||
            'https://i.pinimg.com/474x/fa/d5/e7/fad5e79954583ad50ccb3f16ee64f66d.jpg',
        }}
        style={styles.avatar}
      />

      {/* Display Name */}
      <Text style={styles.label}>Display Name</Text>
      <TextInput
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Enter display name"
        placeholderTextColor="#888"
        style={[styles.input, !isEditing && styles.inputDisabled]}
        editable={isEditing}
      />

      {/* Avatar URL */}
      <Text style={styles.label}>Avatar URL</Text>
      <TextInput
        value={avatarUrl}
        onChangeText={setAvatarUrl}
        placeholder="Enter avatar URL"
        placeholderTextColor="#888"
        style={[styles.input, !isEditing && styles.inputDisabled]}
        editable={isEditing}
      />

      {/* Buttons */}
      {isEditing ? (
        <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveButton}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => setIsEditing(true)}
          style={[styles.saveButton, { backgroundColor: COLORS.primary }]}
        >
          <Text style={styles.saveButtonText}>Edit Profile</Text>
          {/* Controls */}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={handleLogout}
        style={[styles.ButtonLogout, { backgroundColor: COLORS.primary }]}
      >
        <Text style={styles.saveButtonText}>Logout</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.white,
  },
  label: {
    color: COLORS.white,
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10,
  },
  // value: {
  //   fontSize: 16,
  //   marginBottom: 10,
  //   fontWeight: '500',
  //   color: COLORS.white,
  // },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: COLORS.white,
  },
  inputDisabled: {
    backgroundColor: COLORS.border,
    color: COLORS.mediumGray,
  },
  saveButton: {
    backgroundColor: COLORS.bgMossGreen,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },

  ButtonLogout: {
    backgroundColor: COLORS.bgMossGreen,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 240,
  },

  avatar: { width: 100, height: 100, borderRadius: 60, marginBottom: 40 },
});
