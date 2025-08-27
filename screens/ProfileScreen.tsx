import { COLORS } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { DoorOpenIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const router = useRouter();

export default function Profile() {
  const { user, updateProfile, loading, logout } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? '');
      setAvatarUrl(user.avatarUrl ?? '');
    }
  }, [user]);

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
          uri: user?.avatarUrl || 'https://via.placeholder.com/100',
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
      <View style={styles.controls}>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <DoorOpenIcon size={32} color="white" />
          <Text style={styles.text}>Exit</Text>
        </Pressable>
      </View>
      <TouchableOpacity
        onPress={logout}
        style={[styles.saveButton, { backgroundColor: COLORS.primary }]}
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
  value: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '500',
    color: COLORS.white,
  },
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
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: COLORS.BackgroundColor,
    opacity: 0.5,
    borderTopWidth: 2,
    borderTopColor: COLORS.white + '40',
    marginBottom: 6,
    marginTop: 364,
    marginRight: 300,
  },
  button: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
    color: COLORS.white,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  avatar: { width: 100, height: 100, borderRadius: 60, marginBottom: 40 },
});
