/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================ store/authSlice.ts ============================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import authApi, { UpdateProfilePayload } from '../api/authApi';

import { api } from '../lib/api';
import { fetchMe, verifyOtp } from '../lib/auth';
import { clearToken, getToken, saveToken } from '../lib/storage';

export type AuthState = {
  token: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any | null;
  loading: boolean;
  error?: string;
  avatarLoading: boolean;
  profileLoading: boolean;
};

const initialState: AuthState = {
  token: null,
  user: null,
  loading: false,
  avatarLoading: false,
  profileLoading: false,
};

export const hydrateAuth = createAsyncThunk('auth/hydrate', async () => {
  const t = await getToken();
  console.log('rechercher du token');
  if (!t) return { token: null, user: null };
  console.log('rechercher du token', t);

  const me = await fetchMe();
  console.log(`user fetche me : ${JSON.stringify(me)}`);
  return { token: t, user: me };
});

export const requestOtp = createAsyncThunk('auth/request-otp', async (email: string) => {
  const res = await authApi.requestOtp(email);
  return res.data; // contains requestId + message
});

export const doVerifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ userIdentifier, code }: { userIdentifier: string; code: string }) => {
    console.log(`information de verification recue ${userIdentifier}, code : ${code}`);
    const res = await verifyOtp(userIdentifier, code);
    await saveToken(res.accessToken);
    const me = res.user || (await fetchMe());
    console.log(`information ${res} me :${me}`);
    return { token: res.accessToken, user: me };
  }
);
export const doUploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const { data } = await api.patch('/user/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data; // should contain updated avatarUrl
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to upload avatar');
    }
  }
);

export const doUpdateProfile = createAsyncThunk(
  'auth/update-profile',
  async (updates: UpdateProfilePayload, { getState }) => {
    const state = getState() as { auth: AuthState };
    const token = state.auth.token!;
    const res = await authApi.updateProfile(updates, token);
    const updatedUser = res.data;
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await clearToken();
  return true;
});

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(hydrateAuth.pending, (s) => {
      s.loading = true;
      s.error = undefined;
    });
    b.addCase(hydrateAuth.fulfilled, (s, a) => {
      s.loading = false;
      s.token = a.payload.token;
      s.user = a.payload.user;
    });
    b.addCase(doUploadAvatar.pending, (state) => {
      state.avatarLoading = true;
      state.error = undefined;
    })
      .addCase(doUploadAvatar.fulfilled, (state, action: PayloadAction<{ avatarUrl: string }>) => {
        state.avatarLoading = false;
        if (state.user) state.user = { ...state.user, ...action.payload };
      })
      .addCase(doUploadAvatar.rejected, (state, action) => {
        state.avatarLoading = false;
        state.error = (action.payload as string) || 'Avatar upload failed';
      });

    b.addCase(hydrateAuth.rejected, (s, a) => {
      s.loading = false;
      s.error = String(a.error.message || '');
    });

    b.addCase(requestOtp.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
      .addCase(requestOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(requestOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to request OTP';
      });

    b.addCase(doVerifyOtp.pending, (s) => {
      s.loading = true;
      s.error = undefined;
    });
    b.addCase(doVerifyOtp.fulfilled, (s, a) => {
      s.loading = false;
      s.token = a.payload.token;
      s.user = a.payload.user;
    });
    b.addCase(doVerifyOtp.rejected, (s, a) => {
      s.loading = false;
      s.error = String(a.error.message || '');
    });

    b.addCase(logout.fulfilled, (state) => {
      state.token = null;
      state.user = null;
      state.error = undefined;
      state.profileLoading = false;
      state.avatarLoading = false;
    });
    b.addCase(doUpdateProfile.pending, (state) => {
      state.profileLoading = true;
      state.error = undefined;
    })
      .addCase(doUpdateProfile.fulfilled, (state, action: PayloadAction<Record<string, any>>) => {
        state.profileLoading = false;
        if (state.user) state.user = { ...state.user, ...action.payload };
      })
      .addCase(doUpdateProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.error.message ?? 'Profile update failed';
      });
  },
});

export default slice.reducer;
