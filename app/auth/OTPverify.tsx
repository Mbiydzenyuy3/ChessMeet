// app/auth/OTPVerify.tsx
import React, { useRef, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { doVerifyOtp } from '@/store/authSlice';
import { COLORS } from '@/constants/colors';
import { useAppDispatch, useAppSelector } from '@/store';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function OTPVerify() {
  const router = useRouter();
  const { userIdentifier } = useLocalSearchParams<{ userIdentifier: string }>();

  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<TextInput[]>([]);

  const handleChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;

    try {
      const resultAction = await dispatch(doVerifyOtp({ userIdentifier, code }));

      if (doVerifyOtp.fulfilled.match(resultAction)) {
        console.log('✅ OTP Vérifié et token sauvegardé');
        // Avec expo-router → redirect vers (main)/index.tsx = Lobby
        router.replace('/main');
      } else {
        console.error('❌ OTP invalide:', resultAction.error.message);
      }
    } catch (err) {
      console.error('❌ Erreur lors de la vérification OTP:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: 'assets/images/chesslogo.jpeg' }} style={styles.crown} />
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

      <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify & Continue'}</Text>
      </TouchableOpacity>

      {error && <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text>}
    </View>
  );
}

// ✅ Styles identiques à avant
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BackgroundColor,
  },
  crown: { width: 50, height: 50, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 8, color: COLORS.white },
  subtitle: { fontSize: 14, color: COLORS.white, textAlign: 'center', marginBottom: 24 },
  email: { fontWeight: '500', color: COLORS.white },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  otpInput: {
    borderWidth: 1,
    borderColor: COLORS.white,
    width: 40,
    color: COLORS.white,
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
  buttonText: { color: COLORS.white, fontWeight: '600', textAlign: 'center', fontSize: 16 },
});
