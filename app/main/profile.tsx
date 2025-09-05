import { COLORS } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { clearToken } from '@/lib/storage';
import { useAudioPlayer } from 'expo-audio';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import lobby from '../../assets/images/woodenbg.jpg';
import clickSound from '../../assets/sound/click.mp3';

const { width, height } = Dimensions.get('window');

export default function Profile() {
  const click = useAudioPlayer(clickSound);
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
    <ImageBackground
      source={lobby} // ✅ wooden background
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
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
            placeholderTextColor="#9e8a78"
            style={[styles.input, !isEditing && styles.inputDisabled]}
            editable={isEditing}
            selectionColor="#D4AF37"
          />

          {/* Avatar URL */}
          <Text style={styles.label}>Avatar URL</Text>
          <TextInput
            value={avatarUrl}
            onChangeText={setAvatarUrl}
            placeholder="Enter avatar URL"
            placeholderTextColor="#9e8a78"
            style={[styles.input, !isEditing && styles.inputDisabled]}
            editable={isEditing}
            selectionColor="#D4AF37"
          />

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {isEditing ? (
              <TouchableOpacity
                onPress={() => {
                  click.play();
                  handleSave();
                }}
                disabled={loading}
                style={styles.actionButton}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF8E1" />
                ) : (
                  <Text style={styles.actionButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  click.play();
                  setIsEditing(true);
                }}
                style={styles.actionButton}
              >
                <Text style={styles.actionButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => {
              click.play();
              handleLogout();
            }}
            style={[styles.actionButton, styles.logoutButton]}
          >
            <Text style={styles.actionButtonText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
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
    flex: 1,
    backgroundColor: COLORS.overlay,
    width: '100%',
  },
  container: {
    padding: 20,
    // backgroundColor: COLORS.BackgroundColor,
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

  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: COLORS.buttonOtp, // SaddleBrown color
    borderWidth: 2,
    borderColor: COLORS.borderColor, // Gold border
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  actionButtonText: {
    color: COLORS.whiteOtpText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: COLORS.logout, // Darker brown for logout
    marginTop: 180,
    borderColor: COLORS.buttonOtp,
  },

  avatar: { width: 100, height: 100, borderRadius: 60, marginBottom: 30 },
});
