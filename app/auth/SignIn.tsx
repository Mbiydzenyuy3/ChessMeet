// // app/auth/SignIn.tsx
// import api from '@/api/api';
// import { COLORS } from '@/constants/colors';
// import { useRouter } from 'expo-router';
// import { Formik } from 'formik';
// import React, { useState } from 'react';
// import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import * as Yup from 'yup';

// const signInSchema = Yup.object().shape({
//   email: Yup.string().email('Please enter a valid email').required('Email is required'),
// });

// export default function SignIn() {
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const handleSubmitOtp = async (email: string) => {
//     try {
//       const response = await api.post('/auth/request-otp', { email });

//       if (response.data?.success || response.status === 201 || response.status === 200) {
//         const userIdentifier = response.data?.userIdentifier ?? email;
//         // ✅ expo-router → navigate vers OTPVerify
//         router.push({ pathname: '/auth/OTPverify', params: { userIdentifier } });
//       } else {
//         console.log('Error sending OTP:', response.data?.message || 'Unknown error');
//       }
//     } catch (err: unknown) {
//       console.error('Failed to request OTP:', err);
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <View style={styles.container}>
//       <Image source={{ uri: 'assets/images/chesslogo.jpeg' }} style={styles.crown} />
//       <Text style={styles.title}>Welcome to ChessMeet</Text>
//       <Text style={styles.subtitle}>Enter your email to get started</Text>

//       <Formik
//         initialValues={{ email: '' }}
//         validationSchema={signInSchema}
//         onSubmit={({ email }) => handleSubmitOtp(email)}
//       >
//         {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
//           <>
//             <View style={styles.inputContainer}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="email"
//                 placeholderTextColor="#888"
//                 value={values.email}
//                 onChangeText={handleChange('email')}
//                 onBlur={handleBlur('email')}
//                 autoCapitalize="none"
//                 keyboardType="email-address"
//                 underlineColorAndroid="transparent"
//                 selectionColor={COLORS.inputText}
//               />
//             </View>
//             {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

//             <TouchableOpacity
//               style={[styles.button, (!isValid || loading) && { opacity: 0.6 }]}
//               onPress={() => handleSubmit()}
//               disabled={!isValid || loading}
//             >
//               <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send'}</Text>
//             </TouchableOpacity>
//           </>
//         )}
//       </Formik>

//       <Text style={styles.footerText}>
//         We’ll send you a verification code to confirm your identity
//       </Text>
//     </View>
//   );
// }

// // ✅ Styles remain the same
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.BackgroundColor,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//   },
//   crown: { width: 50, height: 50, marginBottom: 20 },
//   title: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: COLORS.white,
//     marginBottom: 5,
//     textAlign: 'center',
//   },
//   error: { color: COLORS.ErrorTextColor, marginBottom: 10 },
//   subtitle: { fontSize: 14, color: COLORS.white, marginBottom: 30, textAlign: 'center' },
//   inputContainer: {
//     width: '100%',
//     backgroundColor: COLORS.white,
//     borderRadius: 8,
//     paddingHorizontal: 15,
//     paddingVertical: 5,
//     marginBottom: 10,
//     elevation: 2,
//   },
//   input: { height: 45, fontSize: 16, color: COLORS.inputText },
//   button: {
//     backgroundColor: COLORS.bgMossGreen,
//     borderRadius: 8,
//     paddingVertical: 14,
//     paddingHorizontal: 40,
//     alignItems: 'center',
//     width: '100%',
//     marginBottom: 20,
//   },
//   buttonText: { color: COLORS.whitetext, fontSize: 16, fontWeight: '600' },
//   footerText: { fontSize: 12, color: COLORS.white, textAlign: 'center', paddingHorizontal: 20 },
// });

// app/auth/SignIn.tsx
import api from '@/api/api';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import React, { useState } from 'react';
// Import ImageBackground
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Yup from 'yup';
import Game from '../../assets/images/chesswb.png';
import lobby from '../../assets/images/woodenbg.jpg';
import { COLORS } from '../../constants/colors';

const signInSchema = Yup.object().shape({
  email: Yup.string().email('Please enter a valid email').required('Email is required'),
});

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmitOtp = async (email: string) => {
    try {
      setLoading(true); // Ensure loading state is set
      const response = await api.post('/auth/request-otp', { email });

      if (response.data?.success || response.status === 201 || response.status === 200) {
        const userIdentifier = response.data?.userIdentifier ?? email;
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

  // The logic above remains unchanged. We only update the JSX and styles below.
  return (
    <ImageBackground
      source={lobby} // Use the new background image
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Image source={Game} style={styles.logo} />
        <Text style={styles.title}>ChessMeet</Text>
        <Text style={styles.subtitle}>Enter your email to begin your quest</Text>

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
                  placeholder="Your Scroll (Email)"
                  placeholderTextColor="#9e8a78"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  selectionColor="#D4AF37"
                />
              </View>
              {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

              <TouchableOpacity
                style={[styles.button, (!isValid || loading) && { opacity: 0.6 }]}
                onPress={() => handleSubmit()}
                disabled={!isValid || loading}
              >
                <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Code'}</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>

        <Text style={styles.footerText}>A verification code will be sent to your inbox</Text>
      </View>
    </ImageBackground>
  );
}

// ✅ NEW Styles for a wooden, game-like UI
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlayBox, // Dark overlay for better text readability
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.logo, // Gold border
  },
  title: {
    fontFamily: 'CinzelDecorative-Bold', // Our new gamer font
    fontSize: 36,
    color: COLORS.buttonText, // Creamy white
    marginBottom: 10,
    textShadowColor: COLORS.whiteTitleTwo,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.sub,
    marginBottom: 40,
    fontStyle: 'italic',
  },
  inputContainer: {
    width: '100%',
    backgroundColor: COLORS.otpInput, // Dark wood input background
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderWidth, // Wood border color
    marginBottom: 10,
  },
  input: {
    height: 50,
    fontSize: 16,
    color: COLORS.buttonText, // Creamy text
    paddingHorizontal: 15,
  },
  error: {
    color: COLORS.whiteshade, // Muted red for errors
    marginBottom: 10,
  },
  button: {
    backgroundColor: COLORS.buttonOtp, // SaddleBrown color
    borderWidth: 2,
    borderColor: COLORS.borderColor, // Gold border
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: COLORS.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.footer, // Lighter wood color
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
