// /* eslint-disable @typescript-eslint/no-explicit-any */
// // ============================ store/authSlice.ts ============================

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import authApi, { UpdateProfilePayload } from '../api/authApi';
import { clearToken, getToken, saveToken } from '../lib/storage';

// CLEANUP 1: Define a proper type for the user object.
export interface IUser {
  _id: string;
  displayName?: string;
  avatarUrl?: string;
  // Add any other user properties you expect from your API
}

// CLEANUP 2: Use the IUser type in your state.
export type AuthState = {
  token: string | null;
  user: IUser | null; // Use the strong type instead of 'any'
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

// CLEANUP 3: All thunks now use the centralized 'authApi' service.
export const hydrateAuth = createAsyncThunk('auth/hydrate', async () => {
  const token = await getToken();
  if (!token) return { token: null, user: null };
  // Use the API service
  const response = await authApi.fetchMe();
  return { token, user: response.data };
});

export const requestOtp = createAsyncThunk('auth/request-otp', async (email: string) => {
  const response = await authApi.requestOtp(email);
  return response.data;
});

export const doVerifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ userIdentifier, code }: { userIdentifier: string; code: string }) => {
    const response = await authApi.verifyOtp(userIdentifier, code);
    await saveToken(response.data.accessToken);
    const me = response.data.user || (await authApi.fetchMe()).data;
    return { token: response.data.accessToken, user: me };
  }
);

// CLEANUP 4: Thunks are simplified. No more 'getState' or 'token' logic.
export const uploadAvatar = createAsyncThunk('auth/upload-avatar', async (formData: FormData) => {
  // The interceptor handles the token automatically.
  const response = await authApi.uploadAvatar(formData);
  return response.data; // Assuming the API returns the updated data
});

export const doUpdateProfile = createAsyncThunk(
  'auth/update-profile',
  async (updates: UpdateProfilePayload) => {
    // The interceptor handles the token automatically.
    const response = await authApi.updateProfile(updates);
    return response.data;
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await clearToken();
});

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // ... (pending and rejected cases for hydrate, requestOtp, doVerifyOtp)
    builder
      .addCase(hydrateAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.loading = false;
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.loading = false;
        state.token = null;
        state.user = null;
      });

    builder.addCase(doVerifyOtp.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    });

    builder.addCase(logout.fulfilled, (state) => {
      state.token = null;
      state.user = null;
    });

    // CLEANUP 5: Use the strong IUser type in fulfilled actions.
    builder
      .addCase(uploadAvatar.pending, (state) => {
        state.avatarLoading = true;
        state.error = undefined;
      })
      .addCase(uploadAvatar.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.avatarLoading = false;
        state.user = action.payload;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.avatarLoading = false;
        state.error = action.error.message || 'Avatar upload failed';
      });

    builder
      .addCase(doUpdateProfile.pending, (state) => {
        state.profileLoading = true;
        state.error = undefined;
      })
      .addCase(doUpdateProfile.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.profileLoading = false;
        state.user = action.payload;
      })
      .addCase(doUpdateProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.error.message ?? 'Profile update failed';
      });

    // ... (other reducer cases)
  },
});

export default slice.reducer;
