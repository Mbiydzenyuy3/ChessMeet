// app/auth/SignIn.tsx
import api from '@/api/api';
import { COLORS } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Yup from 'yup';

const signInSchema = Yup.object().shape({
  email: Yup.string().email('Please enter a valid email').required('Email is required'),
});

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmitOtp = async (email: string) => {
    try {
      const response = await api.post('/auth/request-otp', { email });

      if (response.data?.success || response.status === 201 || response.status === 200) {
        const userIdentifier = response.data?.userIdentifier ?? email;
        // ✅ expo-router → navigate vers OTPVerify
        router.push({ pathname: '/auth/OTPverify', params: { userIdentifier } });
      } else {
        console.log('Error sending OTP:', response.data?.message || 'Unknown error');
      }
    } catch (err: unknown) {
      console.error('Failed to request OTP:', err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <Image source={{ uri: 'assets/images/chesslogo.jpeg' }} style={styles.crown} />
      <Text style={styles.title}>Welcome to ChessMeet</Text>
      <Text style={styles.subtitle}>Enter your email to get started</Text>

      <Formik
        initialValues={{ email: '' }}
        validationSchema={signInSchema}
        onSubmit={({ email }) => handleSubmitOtp(email)}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
          <>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="email"
                placeholderTextColor="#888"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                autoCapitalize="none"
                keyboardType="email-address"
                underlineColorAndroid="transparent"
                selectionColor={COLORS.inputText}
              />
            </View>
            {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

            <TouchableOpacity
              style={[styles.button, (!isValid || loading) && { opacity: 0.6 }]}
              onPress={() => handleSubmit()}
              disabled={!isValid || loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send'}</Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>

      <Text style={styles.footerText}>
        We’ll send you a verification code to confirm your identity
      </Text>
    </View>
  );
}

// ✅ Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BackgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  crown: { width: 50, height: 50, marginBottom: 20 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 5,
    textAlign: 'center',
  },
  error: { color: COLORS.ErrorTextColor, marginBottom: 10 },
  subtitle: { fontSize: 14, color: COLORS.white, marginBottom: 30, textAlign: 'center' },
  inputContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 10,
    elevation: 2,
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
  footerText: { fontSize: 12, color: COLORS.white, textAlign: 'center', paddingHorizontal: 20 },
});
