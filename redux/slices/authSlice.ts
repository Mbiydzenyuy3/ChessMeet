// redux/slices/authSlice.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import authApi, { VerifyOtpRes } from '../../api/authApi';

type AuthState = {
  token: string | null;
  user: { id: string; email: string; name?: string } | null;
  loading: boolean;
  error: string | null;
  bootstrapped: boolean; // finished reading token from storage
};

const initialState: AuthState = {
  token: null,
  user: null,
  loading: false,
  error: null,
  bootstrapped: false,
};

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async () => {
  const token = await AsyncStorage.getItem('token');
  const userRaw = await AsyncStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  return { token, user };
});

export const requestOtp = createAsyncThunk('auth/request-otp', async (email: string) => {
  const res = await authApi.requestOtp(email);
  return res.data;
});

export const verifyOtp = createAsyncThunk(
  'auth/verify-otp',
  async ({ email, otp }: { email: string; otp: string }) => {
    const res = await authApi.verifyOtp(email, otp);
    const data: VerifyOtpRes = res.data;
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
  return true;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.bootstrapped = true;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.bootstrapped = true;
      })
      .addCase(requestOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(requestOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to request OTP';
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'OTP verification failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
      });
  },
});

export default authSlice.reducer;
