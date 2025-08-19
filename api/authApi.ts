import { ENDPOINTS } from '../constants/endpoints';
import api from './api';

export interface RequestOtpRes {
  userIdentifier: string; // <-- add this (backend returns it)
  message: string;
}

export interface VerifyOtpRes {
  accessToken: string; // backend returns accessToken
  user: { _id: string; email: string; displayName?: string };
}

const authApi = {
  requestOtp: (email: string) => api.post<RequestOtpRes>(ENDPOINTS.REQUEST_OTP, { email }),

  verifyOtp: (userIdentifier: string, code: string) =>
    api.post<VerifyOtpRes>(ENDPOINTS.VERIFY_OTP, { userIdentifier, code }),
};

export default authApi;
