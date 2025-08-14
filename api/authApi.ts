// api/authApi.ts
import axiosClient from './axiosClient';

export const authApi = {
  sendOtp: (phoneOrEmail: string) => axiosClient.post('/auth/send-otp', { phoneOrEmail }),

  verifyOtp: (phoneOrEmail: string, otp: string) =>
    axiosClient.post('/auth/verify-otp', { phoneOrEmail, otp }),

  getProfile: () => axiosClient.get('/auth/profile'),
};
