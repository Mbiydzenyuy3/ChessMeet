//api/authApi.ts
import { ENDPOINTS } from '../constants/endpoints';
import api from './api';

export interface RequestOtpRes {
  email: string; // backend returns this
}

export interface VerifyOtpRes {
  accessToken: string; // backend returns accessToken
  user: { _id: string; userIdentifier: string; avatarUrl: string; code: string };
}

// Define the allowed update fields
export interface UpdateProfilePayload {
  displayName?: string;
  avatarUrl?: string;
}

export interface UpdateProfileRes {
  _id: string;
  avatarUrl: string;
  displayName?: string;
}

const authApi = {
  requestOtp: (email: string) => api.post<RequestOtpRes>(ENDPOINTS.REQUEST_OTP, { email }),

  verifyOtp: (userIdentifier: string, code: string) =>
    api.post<VerifyOtpRes>(ENDPOINTS.VERIFY_OTP, { userIdentifier, code }),

  updateProfile: (updates: UpdateProfilePayload, token: string) =>
    api.patch('/user/me', updates, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  // Add the new function to upload the avatar
  uploadAvatar: (formData: FormData, token: string) =>
    api.post('/user/me/avatar', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data', // Crucial for file uploads
      },
    }),
};

export default authApi;
