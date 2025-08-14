import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { verifyOTP } from '../../services/auth';

export default function VerifyScreen() {
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();

  const handleVerify = async () => {
    try {
      setLoading(true);
      setError('');
      await verifyOTP(email as string, otp);
      await AsyncStorage.setItem('hasPlayedBefore', 'true');
      router.replace('/(tabs)');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const BOX_COUNT = 6;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔑 Verify Your Email</Text>
      <Text style={styles.subtitle}>Enter the code sent to</Text>
      <Text style={styles.email}>{email}</Text>

      {/* OTP Boxes */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => inputRef.current?.focus()}
        style={styles.otpContainer}
      >
        {Array.from({ length: BOX_COUNT }).map((_, index) => (
          <View key={index} style={styles.otpBox}>
            <Text style={styles.otpText}>{otp[index] || ''}</Text>
          </View>
        ))}
      </TouchableOpacity>

      {/* Hidden Input */}
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={otp}
        onChangeText={(val) => {
          if (/^\d*$/.test(val) && val.length <= BOX_COUNT) {
            setOtp(val);
          }
        }}
        keyboardType="numeric"
        maxLength={BOX_COUNT}
        autoFocus
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleVerify}
        disabled={loading || otp.length < BOX_COUNT}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify OTP</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#636e72',
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0984e3',
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '80%',
  },
  otpBox: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
  },
  button: {
    backgroundColor: '#0984e3',
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});
