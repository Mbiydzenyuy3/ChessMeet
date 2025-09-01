// // app/auth/OTPVerify.tsx
// import { COLORS } from '@/constants/colors';
// import { useAppDispatch, useAppSelector } from '@/store';
// import { doVerifyOtp } from '@/store/authSlice';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import React, { useRef, useState } from 'react';
// import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// export default function OTPVerify() {
//   const router = useRouter();
//   const { userIdentifier } = useLocalSearchParams<{ userIdentifier: string }>();

//   const dispatch = useAppDispatch();
//   const { loading, error } = useAppSelector((state) => state.auth);

//   const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const inputRefs = useRef<TextInput[]>([]);

//   const handleChange = (value: string, index: number) => {
//     const newOtp = [...otp];
//     newOtp[index] = value.slice(-1);
//     newOtp[index] = value.slice(-1);
//     setOtp(newOtp);

//     if (value && index < 5) {
//       inputRefs.current[index + 1]?.focus();
//     }
//   };

//   const handleVerify = async () => {
//     const code = otp.join('');
//     if (code.length !== 6) return;

//     try {
//       const resultAction = await dispatch(doVerifyOtp({ userIdentifier, code }));

//       if (doVerifyOtp.fulfilled.match(resultAction)) {
//         console.log('✅ OTP Vérifié et token sauvegardé');
//         // Avec expo-router → redirect vers (main)/index.tsx = Lobby
//         router.replace('/main');
//       } else {
//         console.error('❌ OTP invalide:', resultAction.error.message);
//       }
//     } catch (err) {
//       console.error('❌ Erreur lors de la vérification OTP:', err);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Image source={{ uri: 'assets/images/chesslogo.jpeg' }} style={styles.crown} />
//       <Text style={styles.title}>Verify OTP</Text>
//       <Text style={styles.subtitle}>
//         We sent a 6-digit code to {'\n'}
//         <Text style={styles.email}>{userIdentifier}</Text>
//       </Text>

//       <View style={styles.otpContainer}>
//         {otp.map((digit, idx) => (
//           <TextInput
//             key={idx}
//             ref={(ref) => {
//               if (ref) inputRefs.current[idx] = ref;
//             }}
//             style={styles.otpInput}
//             value={digit}
//             onChangeText={(text) => handleChange(text, idx)}
//             keyboardType="number-pad"
//             maxLength={1}
//           />
//         ))}
//       </View>

//       <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
//         <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify & Continue'}</Text>
//       </TouchableOpacity>

//       {error && <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text>}
//     </View>
//   );
// }

// // ✅ Styles identiques à avant
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: COLORS.BackgroundColor,
//   },
//   crown: { width: 50, height: 50, marginBottom: 20 },
//   title: { fontSize: 22, fontWeight: '600', marginBottom: 8, color: COLORS.white },
//   subtitle: { fontSize: 14, color: COLORS.white, textAlign: 'center', marginBottom: 24 },
//   email: { fontWeight: '500', color: COLORS.white },
//   otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
//   otpInput: {
//     borderWidth: 1,
//     borderColor: COLORS.white,
//     width: 40,
//     color: COLORS.white,
//     height: 50,
//     textAlign: 'center',
//     fontSize: 18,
//     borderRadius: 8,
//     marginHorizontal: 4,
//   },
//   button: {
//     backgroundColor: COLORS.bgMossGreen,
//     paddingVertical: 14,
//     paddingHorizontal: 40,
//     borderRadius: 8,
//     width: '100%',
//   },
//   buttonText: { color: COLORS.white, fontWeight: '600', textAlign: 'center', fontSize: 16 },
// });

// app/auth/OTPVerify.tsx
import { COLORS } from '@/constants/colors';
import { useAppDispatch, useAppSelector } from '@/store';
import { doVerifyOtp } from '@/store/authSlice';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Game from '../../assets/images/chesswb.png';
import lobby from '../../assets/images/woodenbg.jpg';

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
        router.replace('/main');
      } else {
        console.error('OTP invalide:', resultAction.error.message);
      }
    } catch (err) {
      console.error('Erreur lors de la vérification OTP:', err);
    }
  };

  // The logic remains unchanged. Only updating JSX and styles below.
  return (
    <ImageBackground
      source={lobby} // Use the new background image
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Image source={Game} style={styles.logo} />
        <Text style={styles.title}>Enter Code</Text>
        <Text style={styles.subtitle}>
          A 6-digit code was sent to {'\n'}
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
              selectionColor="#D4AF37"
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify & Continue'}</Text>
        </TouchableOpacity>

        {error && <Text style={styles.errorField}>{error}</Text>}
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
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  errorField: { color: COLORS.whiteshade, marginTop: 10 },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.logo,
  },
  title: {
    fontFamily: 'CinzelDecorative-Bold',
    fontSize: 32,
    color: COLORS.whiteTitle,
    marginBottom: 8,
    textShadowColor: COLORS.whiteTitleTwo,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.grayText,
    textAlign: 'center',
    marginBottom: 32,
  },
  email: {
    fontWeight: 'bold',
    color: COLORS.whiteEmail,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    width: '100%',
    paddingHorizontal: 10,
  },
  otpInput: {
    backgroundColor: COLORS.otpInput,
    borderWidth: 1,
    borderColor: COLORS.borderWidth,
    width: 45,
    height: 55,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.whiteOtpText,
    borderRadius: 8,
  },
  button: {
    backgroundColor: COLORS.buttonOtp,
    borderWidth: 2,
    borderColor: COLORS.borderColor,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
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
});
