// import { UpdateProfilePayload } from '@/api/authApi';
// //api/authApi.ts
// import { api } from '../lib/api';

// export interface RequestOtpRes {
//   email: string; // backend returns this
// }

// export interface VerifyOtpRes {
//   accessToken: string; // backend returns accessToken
//   user: { _id: string; userIdentifier: string; avatarUrl: string; code: string };
// }

// // Define the allowed update fields
// export interface UpdateProfilePayload {
//   displayName?: string;
//   // avatarUrl?: string;
// }

// // export interface UpdateProfileRes {
// //   _id: string;
// //   avatarUrl: string;
// //   displayName?: string;
// // }

// const authApi = {
//   // Functions from lib/auth.ts are now here
//   requestOtp: (email: string) => api.post('/auth/request-otp', { email }),

//   verifyOtp: (userIdentifier: string, code: string) =>
//     api.post('/auth/verify-otp', { userIdentifier, code }),

//   fetchMe: () => api.get('/user/me'),

//   // Functions that no longer need the 'token' parameter
//   updateProfile: (updates: UpdateProfilePayload) => api.patch('/user/me', updates),

//   uploadAvatar: (formData: FormData) => api.post('/user/me/avatar', formData),
// };

// export default authApi;

//api/authApi.ts
import { api } from '@/lib/api';

export interface UpdateProfilePayload {
  displayName?: string;
}

export default {
  requestOtp: (email: string) => api.post('/auth/request-otp', { email }),
  verifyOtp: (userIdentifier: string, code: string) =>
    api.post('/auth/verify-otp', { userIdentifier, code }),
  fetchMe: () => api.get('/user/me'),
  updateProfile: (payload: UpdateProfilePayload) => api.patch('/user/me', payload),
  uploadAvatar: (formData: FormData) =>
    api.post('/user/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
