import api from '@/api/api';
import { COLORS } from '@/constants/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type RootStackParamList = {
  OTPVerify: { userIdentifier: string };
  Lobby: undefined;
};

type OTPVerifyNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OTPVerify'>;

type Props = {
  route: { params: { userIdentifier: string } };
  navigation: OTPVerifyNavigationProp;
};

export default function OTPVerify({ route, navigation }: Props) {
  const { userIdentifier } = route.params;
  // const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<TextInput[]>([]);

  const handleChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // keep only last digit
    setOtp(newOtp);

    // auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;

    setLoading(true);

    try {
      const response = await api.post('/auth/verify-otp', {
        email: userIdentifier, // matches backend
        code, // already a string
      });

      if (response.data?.success) {
        navigation.replace('Lobby');
      } else {
        console.log('Verification failed:', response.data?.message || 'Invalid OTP');
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
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>
        We sent a 6-digit code to {'\n'}
        <Text style={styles.email}>{userIdentifier}</Text>
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={(ref) => {
              if (ref) inputRefs.current[idx] = ref;
            }}
            style={styles.otpInput}
            value={digit}
            onChangeText={(text) => handleChange(text, idx)}
            keyboardType="number-pad"
            maxLength={1}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleVerify}
        disabled={loading} // disable while verifying
      >
        <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify & Continue'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  crown: {
    width: 50,
    height: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.title,
    textAlign: 'center',
    marginBottom: 24,
  },
  email: {
    fontWeight: '500',
    color: COLORS.black,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    width: 40,
    height: 50,
    textAlign: 'center',
    fontSize: 18,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  button: {
    backgroundColor: COLORS.bgMossGreen,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: '100%',
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
});
