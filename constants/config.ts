// constants/config.ts

export const API_BASE_URL = {
  appName: 'ChessMeet',
  version: '1.0.0',

  // Environment-specific configs
  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',

  socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000',

  otpLength: 6,
  aiSuggestionLimit: 3, // Max AI suggestions per turn
};

export const OTP_LENGTH = 6;
export const OTP_RESEND_SECONDS = 45;
