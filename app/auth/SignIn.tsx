import { COLORS } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth'; // ✅ import your custom hook
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Formik } from 'formik';
import React from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Yup from 'yup';

type RootStackParamList = {
  SignIn: undefined;
  OTPVerify: { userIdentifier: string };
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
  const { requestOtp, loading } = useAuth(); // ✅ useAuth replaces local state & API

  const handleSubmitOtp = async (email: string) => {
    try {
      const res = await requestOtp(email).unwrap(); // ✅ unwrap
      const userIdentifier = res?.email ?? email;
      navigation.navigate('OTPVerify', { userIdentifier });
    } catch (err) {
      console.error('Failed to request OTP:', err);
    }
  };
  return (
    <View style={styles.container}>
      <Image source={{ uri: '../images/chesslogo.jpeg' }} style={styles.crown} />
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
    shadowColor: COLORS.blacktext,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  input: { height: 45, fontSize: 16, color: COLORS.inputText, borderWidth: 0, borderRadius: 0 },
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
