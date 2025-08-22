import { COLORS } from '@/constants/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { requestOtp } from '../../redux/slices/authSlice';
import api from '@/api/api';
import { Formik } from 'formik';
import * as Yup from 'yup';

// Navigation stack params
type RootStackParamList = {
  SignIn: undefined;
  OTPVerify: { userIdentifier: string }; // pass email
  Lobby: undefined;
};

type SignInNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

type SignInProps = {
  navigation: SignInNavigationProp;
};

// ✅ Yup schema
const signInSchema = Yup.object().shape({
  email: Yup.string().email('Please enter a valid email').required('Email is required'),
});

export default function SignIn({ navigation }: SignInProps) {
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (email: string) => {
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
          uri: '../images/chesslogo.jpeg',
        }}
        style={styles.crown}
      />
      <Text style={styles.title}>Welcome to ChessMeet</Text>
      <Text style={styles.subtitle}>Enter your email to get started</Text>

      {/* ✅ Wrap form with Formik */}
      <Formik
        initialValues={{ email: '' }}
        validationSchema={signInSchema}
        onSubmit={(values) => handleRequestOtp(values.email)}
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
                underlineColorAndroid="transparent" // removes Android underline
                selectionColor={COLORS.inputText}
              />
            </View>
            {/* ✅ Show error if invalid */}
            {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

            <TouchableOpacity
              style={[styles.button, (!isValid || loading) && { opacity: 0.6 }]}
              onPress={() => handleSubmit()} // ✅ wrap in arrow function
              disabled={!isValid || loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send OTP'}</Text>
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
  error: {
    color: COLORS.ErrorTextColor,
    marginBottom: 10,
  },
  subtitle: { fontSize: 14, color: COLORS.white, marginBottom: 30, textAlign: 'center' },
  inputContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 10,
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
    borderWidth: 0,
    borderRadius: 0,
  },
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
