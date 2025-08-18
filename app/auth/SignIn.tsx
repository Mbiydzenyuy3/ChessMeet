import { COLORS } from '@/constants/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Formik } from 'formik';
import React from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Yup from 'yup';
import { requestOtp } from '../../redux/slices/authSlice';
import { useAppDispatch } from '../../redux/slices/hooks';

type RootStackParamList = {
  SignIn: undefined;
  OTPVerify: { email: string };
};

type SignInNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

type SignInProps = {
  navigation: SignInNavigationProp;
};

type SignInFormValues = {
  email: string;
};

const SignInSchema = Yup.object().shape({
  email: Yup.string()
    .matches(/^([^\s@]+@[^\s@]+\.[^\s@]+)$/, 'Enter a valid email address')
    .required('Email is required'),
});

export default function SignIn({ navigation }: SignInProps) {
  const dispatch = useAppDispatch();

  const handleRequestOtp = async (values: SignInFormValues) => {
    await dispatch(requestOtp(values.email));
    navigation.navigate('OTPVerify', { email: values.email });
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

      <Formik
        initialValues={{ email: '' }}
        validationSchema={SignInSchema}
        onSubmit={handleRequestOtp}
      >
        {({ handleChange, handleSubmit, values, errors, touched }) => (
          <>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Phone number or email"
                placeholderTextColor="#888"
                value={values.email}
                onChangeText={handleChange('email')}
              />
            </View>
            {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <TouchableOpacity style={styles.button} onPress={() => handleSubmit()}>
              <Text style={styles.buttonText}>Send OTP</Text>
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
    color: COLORS.blacktext,
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.blacktext,
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    backgroundColor: COLORS.whitetext,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 10,
  },
  input: {
    height: 45,
    fontSize: 16,
    color: COLORS.inputText,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  button: {
    backgroundColor: COLORS.ctaButton,
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
    color: COLORS.blacktext,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
