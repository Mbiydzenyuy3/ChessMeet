// app/auth/OTPVerify.tsx
import { COLORS } from '@/constants/colors';
import { useAppDispatch, useAppSelector } from '@/store';
import { doVerifyOtp } from '@/store/authSlice';
import { useLocalSearchParams, useRouter } from 'expo-router';

import React, { useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Game from '../../assets/images/chesswb.png';
import lobby from '../../assets/videos/otpbg.gif';

export default function OTPVerify() {
  // navigation and route params
  const router = useRouter();
  // Grab the `userIdentifier` (email/phone) from the route's search params.
  // Type parameter ensures `userIdentifier` is string | undefined depending on route.
  const { userIdentifier } = useLocalSearchParams<{ userIdentifier: string }>();
  //redux hook
  const dispatch = useAppDispatch();
  // We read the `loading` and `error` fields from the auth slice to show UI state.
  const { loading, error } = useAppSelector((state) => state.auth);

  // Local component state for the 6 OTP digits. Using an array makes it easy to
  // map to six visible TextInput components and manage partial updates.
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // Refs: one for a hidden/fallback TextInput that can accept a whole one-time-code
  // (useful for SMS autofill or when the user pastes the whole code at once),
  // and an array of refs for each visible single-digit TextInput.
  const hiddenInputRef = useRef<TextInput>(null);
  const inputRefs = useRef<TextInput[]>([]);

  // Function to handle single-digit input
  const handleSingleDigitChange = (value: string, index: number) => {
    // This logic only runs when a user manually types a digit
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to the next input field
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Automatically verify when all inputs are filled
    if (newOtp.join('').length === 6) {
      handleVerify();
    }
  };

  // Handle paste (multi-character) starting at index `startIdx`
  const handleMultiPaste = (pasted: string, startIdx: number) => {
    if (!pasted) return;
    // sanitize to digits only
    const digits = pasted
      .replace(/\D/g, '')
      .split('')
      .slice(0, 6 - startIdx);
    if (digits.length === 0) return;

    const newOtp = [...otp];
    for (let i = 0; i < digits.length; i++) {
      newOtp[startIdx + i] = digits[i];
    }

    setOtp(newOtp);

    // find next empty index to focus, if any
    const nextEmpty = newOtp.findIndex((v) => v === '');
    if (nextEmpty !== -1) {
      inputRefs.current[nextEmpty]?.focus();
    } else {
      // all filled
      handleVerify();
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
        console.error('OTP invalide:', resultAction.error?.message ?? 'unknown');
      }
    } catch (err) {
      console.error('Erreur lors de la vérification OTP:', err);
    }
  };

  return (
    <ImageBackground source={lobby} style={styles.container} resizeMode="cover">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.overlay}>
          <Image source={Game} style={styles.logo} />
          <Text style={styles.title}>Enter Code</Text>
          <Text style={styles.subtitle}>
            A 6-digit code was sent to {'\n'}
            <Text style={styles.email}>{userIdentifier}</Text>
          </Text>

          {/* ✅ Hidden TextInput to capture full-length pastes and autofill */}
          <TextInput
            ref={hiddenInputRef}
            style={styles.hiddenInput}
            keyboardType="number-pad"
            maxLength={6} // allow full OTP for autofill
            onChangeText={(text) => {
              // SMS autofill or direct set into hidden input
              if (!text) return;
              const digits = text.replace(/\D/g, '').split('').slice(0, 6);
              setOtp((prev) => {
                const newOtp = [...prev];
                for (let i = 0; i < digits.length; i++) {
                  newOtp[i] = digits[i];
                }
                return newOtp;
              });
              if (digits.length === 6) {
                handleVerify();
              }
            }}
            textContentType="oneTimeCode" // iOS autofill
            autoComplete="sms-otp" // Android autofill
          />

          <View style={styles.otpContainer}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(ref) => {
                  if (ref) inputRefs.current[idx] = ref;
                }}
                style={styles.otpInput}
                value={digit}
                // ✅ handle paste + typing
                onChangeText={(text) => {
                  if (!text) {
                    // user deleted this box
                    handleSingleDigitChange('', idx);
                    return;
                  }

                  // If text length > 1, a paste happened into this box (native maxLength allowed it)
                  if (text.length > 1) {
                    handleMultiPaste(text, idx);
                  } else {
                    handleSingleDigitChange(text, idx);
                  }
                }}
                keyboardType="number-pad"
                // Allow the first visible input to accept the full pasted string.
                // Other inputs keep maxLength 1.
                maxLength={idx === 0 ? 6 : 1}
                selectionColor="#D4AF37"
              />
            ))}
          </View>
          <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify & Continue'}</Text>
          </TouchableOpacity>
          {error && <Text style={styles.errorField}>{String(error)}</Text>}
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

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
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
    // Note: It's good practice to make the hidden input accessible for screen readers
    // but the `onFocus` redirection might require additional accessibility considerations.
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
  keyboardAvoidingContainer: {
    flex: 1,
    marginBottom: 50,
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
