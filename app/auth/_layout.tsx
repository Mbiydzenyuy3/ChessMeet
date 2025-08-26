// // app/auth/_layout.tsx

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="SignIn" />
      <Stack.Screen name="OTPVerify" />
    </Stack>
  );
}
