/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================ store/authSlice.ts ============================
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import authApi, { UpdateProfilePayload, UpdateProfileRes } from '../api/authApi'; // Import the response type

import { fetchMe, verifyOtp } from '../lib/auth';
import { clearToken, getToken, saveToken } from '../lib/storage';

export type AuthState = {
  token: string | null;
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

// ... (hydrateAuth, requestOtp, doVerifyOtp thunks remain the same) ...
export const hydrateAuth = createAsyncThunk('auth/hydrate', async () => {
  const t = await getToken();
  if (!t) return { token: null, user: null };
  const me = await fetchMe();
  return { token: t, user: me };
});

export const requestOtp = createAsyncThunk('auth/request-otp', async (email: string) => {
  const res = await authApi.requestOtp(email);
  return res.data;
});

export const doVerifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ userIdentifier, code }: { userIdentifier: string; code: string }) => {
    const res = await verifyOtp(userIdentifier, code);
    await saveToken(res.accessToken);
    const me = res.user || (await fetchMe());
    return { token: res.accessToken, user: me };
  }
);

// CORRECTED THUNK
export const uploadAvatar = createAsyncThunk(
  'auth/upload-avatar',
  async (formData: FormData, { getState }) => {
    const state = getState() as { auth: AuthState };
    const token = state.auth.token!;

    // CHANGE: Make only ONE API call. The backend endpoint handles the database update.
    const response = await authApi.uploadAvatar(formData, token);

    // CHANGE: Directly return the user object from the upload response.
    // The backend's /user/me/avatar endpoint should return the updated user document.
    return response.data.user;
  }
);

export const doUpdateProfile = createAsyncThunk(
  'auth/update-profile',
  async (updates: UpdateProfilePayload, { getState }) => {
    const state = getState() as { auth: AuthState };
    const token = state.auth.token!;
    const res = await authApi.updateProfile(updates, token);
    // REMOVED: Redundant AsyncStorage.setItem call. Let your persistence layer handle this.
    return res.data;
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
    // ... (hydrateAuth, requestOtp, doVerifyOtp cases remain the same) ...
    b.addCase(hydrateAuth.pending, (s) => {
      s.loading = true;
      s.error = undefined;
    });
    b.addCase(hydrateAuth.fulfilled, (s, a) => {
      s.loading = false;
      s.token = a.payload.token;
      s.user = a.payload.user;
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

    // CORRECTED REDUCER CASES
    b.addCase(uploadAvatar.pending, (state) => {
      state.avatarLoading = true;
      state.error = undefined;
    })
      // CHANGE: The payload is now the full user object (or whatever your API returns).
      // Using a specific type like UpdateProfileRes is better than 'any'.
      .addCase(uploadAvatar.fulfilled, (state, action: PayloadAction<UpdateProfileRes>) => {
        state.avatarLoading = false;
        // Update the user state with the fresh data from the server
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.avatarLoading = false;
        state.error = (action.payload as string) || 'Avatar upload failed';
      });

    // ... (logout and doUpdateProfile cases remain the same) ...
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
