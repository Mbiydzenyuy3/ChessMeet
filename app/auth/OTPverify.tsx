import { COLORS } from '@/constants/colors';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { verifyOtp } from '../../redux/slices/authSlice';
import { useAppDispatch } from '../../redux/slices/hooks';

// Define your navigation stack params
type RootStackParamList = {
  OTPVerify: { email: string };
  Lobby: undefined;
};

// Props for OTPVerify
type OTPVerifyProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OTPVerify'>;
  route: RouteProp<RootStackParamList, 'OTPVerify'>;
};

export default function OTPVerify({ route, navigation }: OTPVerifyProps) {
  const { email } = route.params;
  const dispatch = useAppDispatch();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // refs for each input
  const inputRefs = useRef<TextInput[]>([]);

  const handleChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only last character
    setOtp(newOtp);

    // auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    const result = await dispatch(verifyOtp({ email, otp: code }));
    if (verifyOtp.fulfilled.match(result)) {
      navigation.replace('Lobby'); // typed correctly now
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: 'https://www.shutterstock.com/image-vector/queen-crown-vector-icon-chess-600nw-2431362527.jpg',
        }}
        style={styles.crown}
      />
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>
        We sent a 6-digit code to {'\n'}
        <Text style={styles.email}>{email}</Text>
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

      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verify & Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  crown: {
    width: 50,
    height: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.title,
    textAlign: 'center',
    marginBottom: 24,
  },
  email: {
    fontWeight: '500',
    color: COLORS.black,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    width: 40,
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
  buttonText: {
    color: COLORS.white,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
});
