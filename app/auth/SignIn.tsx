import { COLORS } from '@/constants/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { requestOtp } from '../../redux/slices/authSlice';
import api from '@/api/api';

// Navigation stack params
type RootStackParamList = {
  SignIn: undefined;
  OTPVerify: { userIdentifier: string }; // pass requestId OR email
  Lobby: undefined;
};

type SignInNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

type SignInProps = {
  navigation: SignInNavigationProp;
};

export default function SignIn({ navigation }: SignInProps) {
  const [email, setEmail] = useState('');
  // const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async () => {
    if (!email) return;

    setLoading(true);
    try {
      const response = await api.post('/auth/request-otp', { email });

      if (response.data?.success || response.status === 201 || response.status === 200) {
        const userIdentifier = response.data?.userIdentifier ?? email;
        navigation.navigate('OTPVerify', { userIdentifier });
      } else {
        console.log('Error sending OTP:', response.data?.message || 'Unknown error');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Failed to request OTP:', err.message);
      } else {
        console.error('Failed to request OTP: Unknown error', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: 'https://www.shutterstock.com/image-vector/queen-crown-vector-icon-chess-600nw-2431362527.jpg',
        }}
        style={styles.crown}
      />
      <Text style={styles.title}>Welcome to ChessMeet</Text>
      <Text style={styles.subtitle}>Enter your email to get started</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Phone number or email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRequestOtp}
        disabled={loading} // disable while verifying
      >
        <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send OTP'}</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        We’ll send you a verification code to confirm your identity
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.container,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  crown: { width: 50, height: 50, marginBottom: 20 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.blacktext,
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: { fontSize: 14, color: COLORS.blacktext, marginBottom: 30, textAlign: 'center' },
  inputContainer: {
    width: '100%',
    backgroundColor: COLORS.whitetext,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 20,
    elevation: 2,
    shadowColor: COLORS.blacktext,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  input: { height: 45, fontSize: 16, color: COLORS.inputText },
  button: {
    backgroundColor: COLORS.bgMossGreen,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  buttonText: { color: COLORS.whitetext, fontSize: 16, fontWeight: '600' },
  footerText: { fontSize: 12, color: COLORS.blacktext, textAlign: 'center', paddingHorizontal: 20 },
});
