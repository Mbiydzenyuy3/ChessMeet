// api/authApi.ts
import { ENDPOINTS } from '../constants/endpoints';
import api from './api';

export interface RequestOtpRes {
  requestId?: string;
  message?: string;
}

export interface VerifyOtpRes {
  token: string;
  user: { id: string; email: string; name?: string };
}

const authApi = {
  requestOtp: (email: string) => api.post<RequestOtpRes>(ENDPOINTS.REQUEST_OTP, { email }),
  verifyOtp: (email: string, otp: string) =>
    api.post<VerifyOtpRes>(ENDPOINTS.VERIFY_OTP, { email, otp }),
};

export default authApi;
