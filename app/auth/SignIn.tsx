import { COLORS } from '@/constants/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { requestOtp } from '../../redux/slices/authSlice';
import { useAppDispatch } from '../../redux/slices/hooks';

// Define your navigation stack params
type RootStackParamList = {
  SignIn: undefined;
  OTPVerify: { email: string };
};

// Type for navigation prop
type SignInNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

// Props for SignIn
type SignInProps = {
  navigation: SignInNavigationProp;
};

export default function SignIn({ navigation }: SignInProps) {
  const [email, setEmail] = useState('');
  const dispatch = useAppDispatch();

  const handleRequestOtp = async () => {
    await dispatch(requestOtp(email));
    navigation.navigate('OTPVerify', { email });
  };

  return (
    <View style={styles.container}>
      {/* Crown Icon */}
      <Image
        source={{
          uri: 'https://www.shutterstock.com/image-vector/queen-crown-vector-icon-chess-600nw-2431362527.jpg',
        }}
        style={styles.crown}
      />

      {/* Title & Subtitle */}
      <Text style={styles.title}>Welcome to ChessAI</Text>
      <Text style={styles.subtitle}>Enter your phone number or email to get started</Text>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Phone number or email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.button} onPress={handleRequestOtp}>
        <Text style={styles.buttonText}>Send OTP</Text>
      </TouchableOpacity>

      {/* Footer text */}
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
  crown: {
    width: 50,
    height: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.subtitle,
    marginBottom: 30,
    textAlign: 'center',
  },
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
  input: {
    height: 45,
    fontSize: 16,
    color: COLORS.inputText,
  },
  button: {
    backgroundColor: COLORS.button,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  buttonText: {
    color: COLORS.whitetext,
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
