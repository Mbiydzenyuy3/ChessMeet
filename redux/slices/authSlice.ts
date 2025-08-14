import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email?: string;
  phone?: string;
  token: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  otpSent: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  otpSent: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sendOtpStart(state) {
      state.loading = true;
      state.error = null;
    },
    sendOtpSuccess(state) {
      state.loading = false;
      state.otpSent = true;
    },
    sendOtpFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    verifyOtpStart(state) {
      state.loading = true;
      state.error = null;
    },
    verifyOtpSuccess(state, action: PayloadAction<User>) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    verifyOtpFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.otpSent = false;
    },
  },
});

export const {
  sendOtpStart,
  sendOtpSuccess,
  sendOtpFailure,
  verifyOtpStart,
  verifyOtpSuccess,
  verifyOtpFailure,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
