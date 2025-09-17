/* eslint-disable @typescript-eslint/no-explicit-any */
// import { COLORS } from '@/constants/colors';
// import { useAuth } from '@/hooks/useAuth';
// import { clearToken } from '@/lib/storage';
// import { useAudioPlayer } from 'expo-audio';
// import * as ImagePicker from 'expo-image-picker';
// import { useRouter } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Dimensions,
//   Image,
//   ImageBackground,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import lobby from '../../assets/images/woodenbg.jpg';
// import clickSound from '../../assets/sound/click.mp3';

// const { width, height } = Dimensions.get('window');

// export default function Profile() {
//   const { user, updateProfile, uploadAvatar, avatarLoading } = useAuth();
//   const click = useAudioPlayer(clickSound);

//   const [displayName, setDisplayName] = useState('');
//   const [isEditing, setIsEditing] = useState(false);
//   const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     if (user) setDisplayName(user.displayName ?? '');
//   }, [user]);

//   const handleLogout = async () => {
//     await clearToken();
//     router.push('/auth/SignIn');
//   };

//   const pickImageAsync = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Permission required', 'We need camera roll permissions to update your avatar!');
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       allowsEditing: true,
//       quality: 1,
//       aspect: [1, 1],
//     });

//     if (!result.canceled) setSelectedImage(result.assets[0]);
//   };

//   const handleSave = async () => {
//     try {
//       // 1️⃣ Upload avatar if selected
//       if (selectedImage) {
//         const formData = new FormData();
//         const uriParts = selectedImage.uri.split('.');
//         const fileType = uriParts[uriParts.length - 1];

//         formData.append('file', {
//           uri: selectedImage.uri,
//           name: `avatar.${fileType}`,
//           type: `image/${fileType}`,
//         } as unknown as Blob);

//         await uploadAvatar(formData).unwrap();
//         setSelectedImage(null);
//       }

//       if (displayName !== user?.displayName) {
//         await updateProfile({ displayName }).unwrap();
//       }

//       Alert.alert('Success', 'Profile updated successfully!');
//       setIsEditing(false);
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Error', 'Failed to update profile. Please try again.');
//     }
//   };

//   // Determine displayed avatar
//   const imageUri =
//     selectedImage?.uri ||
//     user?.avatarUrl ||
//     'https://i.pinimg.com/474x/fa/d5/e7/fad5e79954583ad50ccb3f16ee64f66d.jpg';

//   return (
//     <ImageBackground source={lobby} style={styles.background} resizeMode="cover">
//       <View style={styles.overlay}>
//         <ScrollView contentContainerStyle={styles.container}>
//           <Text style={styles.title}>My Profile</Text>

//           {/* Avatar */}
//           <TouchableOpacity onPress={isEditing ? pickImageAsync : undefined} disabled={!isEditing}>
//             <Image source={{ uri: imageUri }} style={styles.avatar} />
//             {isEditing && (
//               <View style={styles.editIcon}>
//                 <Text style={styles.editIconText}>EDIT</Text>
//               </View>
//             )}
//           </TouchableOpacity>

//           {/* Display Name */}
//           <Text style={styles.label}>Display Name</Text>
//           <TextInput
//             value={displayName}
//             onChangeText={setDisplayName}
//             placeholder="Enter display name"
//             placeholderTextColor="#9e8a78"
//             style={[styles.input, !isEditing && styles.inputDisabled]}
//             editable={isEditing}
//             selectionColor="#D4AF37"
//           />

//           {/* Buttons */}
//           <View style={styles.buttonContainer}>
//             {isEditing ? (
//               <TouchableOpacity
//                 onPress={() => {
//                   click.play();
//                   handleSave();
//                 }}
//                 disabled={avatarLoading}
//                 style={styles.actionButton}
//               >
//                 {avatarLoading ? (
//                   <ActivityIndicator color="#FFF8E1" />
//                 ) : (
//                   <Text style={styles.actionButtonText}>Save Changes</Text>
//                 )}
//               </TouchableOpacity>
//             ) : (
//               <TouchableOpacity
//                 onPress={() => {
//                   click.play();
//                   setIsEditing(true);
//                 }}
//                 style={styles.actionButton}
//               >
//                 <Text style={styles.actionButtonText}>Edit Profile</Text>
//               </TouchableOpacity>
//             )}
//           </View>

//           <TouchableOpacity
//             onPress={() => {
//               click.play();
//               handleLogout();
//             }}
//             style={[styles.actionButton, styles.logoutButton]}
//           >
//             <Text style={styles.actionButtonText}>Logout</Text>
//           </TouchableOpacity>
//         </ScrollView>
//       </View>
//     </ImageBackground>
//   );
// }

// const styles = StyleSheet.create({
//   avatar: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     marginBottom: 30,
//     borderWidth: 4,
//     borderColor: COLORS.borderColor,
//   },
//   editIcon: {
//     position: 'absolute',
//     bottom: 30,
//     right: 0,
//     backgroundColor: COLORS.shadeText,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: COLORS.borderColor,
//   },
//   editIconText: {
//     color: COLORS.borderColor,
//     fontWeight: 'bold',
//     fontSize: 12,
//   },
//   background: { flex: 1, width, height },
//   overlay: { flex: 1, backgroundColor: COLORS.overlay, width: '100%' },
//   container: { padding: 20, flexGrow: 1 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: COLORS.white },
//   label: { color: COLORS.white, fontSize: 14, marginTop: 10, marginBottom: 10 },
//   input: {
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 15,
//     color: COLORS.white,
//   },
//   inputDisabled: { backgroundColor: COLORS.border, color: COLORS.mediumGray },
//   buttonContainer: { width: '100%', marginTop: 20 },
//   actionButton: {
//     backgroundColor: COLORS.buttonOtp,
//     borderWidth: 2,
//     borderColor: COLORS.borderColor,
//     borderRadius: 8,
//     paddingVertical: 14,
//     alignItems: 'center',
//     width: '100%',
//     marginBottom: 15,
//     shadowColor: COLORS.black,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     elevation: 8,
//   },
//   actionButtonText: { color: COLORS.whiteOtpText, fontSize: 18, fontWeight: 'bold' },
//   logoutButton: { backgroundColor: COLORS.logout, marginTop: 180, borderColor: COLORS.buttonOtp },
// });

//app/main/profile.tsx
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { clearToken } from '@/lib/storage';
import { useAudioPlayer } from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
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
  // We'll add uploadAvatar to useAuth in the next step
  const { user, updateProfile, uploadAvatar } = useAuth();
  const click = useAudioPlayer(clickSound);

  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) setDisplayName(user.displayName ?? '');
  }, [user]);

  const handleLogout = async () => {
    await clearToken();
    router.push('/auth/SignIn');
  };

  const pickImageAsync = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need camera roll permissions to update your avatar!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
      aspect: [1, 1],
    });

    if (!result.canceled) setSelectedImage(result.assets[0]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Upload avatar if a new one is picked
      if (selectedImage) {
        const formData = new FormData();

        // Prepare the file for upload
        formData.append('file', {
          uri: selectedImage.uri,
          name: selectedImage.fileName || `avatar.jpg`,
          type: selectedImage.mimeType || 'image/jpeg',
        } as any);

        // Call the new uploadAvatar thunk
        await uploadAvatar(formData).unwrap();
        // console.log(formData);
        setSelectedImage(null);
      }

      // If display name has changed, update it.
      if (displayName !== user?.displayName) {
        // const payload: UpdateProfilePayload = { displayName };
        await updateProfile({ displayName }).unwrap();
      }

      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Save failed:', err.response?.data || err.message || err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const imageUri =
    selectedImage?.uri ||
    user?.avatarUrl ||
    'https://i.pinimg.com/474x/fa/d5/e7/fad5e79954583ad50ccb3f16ee64f66d.jpg';

  return (
    <ImageBackground source={lobby} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>My Profile</Text>

          {/* Avatar */}
          <TouchableOpacity onPress={isEditing ? pickImageAsync : undefined} disabled={!isEditing}>
            <Image source={{ uri: imageUri }} style={styles.avatar} />
            {isEditing && (
              <View style={styles.editIcon}>
                <Text style={styles.editIconText}>EDIT</Text>
              </View>
            )}
          </TouchableOpacity>

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

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {isEditing ? (
              <TouchableOpacity
                onPress={() => {
                  click.play();
                  handleSave();
                }}
                disabled={isSaving}
                style={styles.actionButton}
              >
                {isSaving ? (
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
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 30,
    borderWidth: 4,
    borderColor: COLORS.borderColor,
  },
  editIcon: {
    position: 'absolute',
    bottom: 30,
    right: 0,
    backgroundColor: COLORS.shadeText,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  editIconText: {
    color: COLORS.borderColor,
    fontWeight: 'bold',
    fontSize: 12,
  },
  background: { flex: 1, width, height },
  overlay: { flex: 1, backgroundColor: COLORS.overlay, width: '100%' },
  container: { padding: 20, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: COLORS.white },
  label: { color: COLORS.white, fontSize: 14, marginTop: 10, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: COLORS.white,
  },
  inputDisabled: { backgroundColor: COLORS.border, color: COLORS.mediumGray },
  buttonContainer: { width: '100%', marginTop: 20 },
  actionButton: {
    backgroundColor: COLORS.buttonOtp,
    borderWidth: 2,
    borderColor: COLORS.borderColor,
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
  actionButtonText: { color: COLORS.whiteOtpText, fontSize: 18, fontWeight: 'bold' },
  logoutButton: { backgroundColor: COLORS.logout, marginTop: 180, borderColor: COLORS.buttonOtp },
});
