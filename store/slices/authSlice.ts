// store/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  phone?: string;
  email?: string;
  username?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Keys for storage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Storage helpers
const getStorageItem = async (key: string) =>
  Platform.OS === 'web' ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key);

const setStorageItem = async (key: string, value: string) =>
  Platform.OS === 'web' ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value);

const removeStorageItem = async (key: string) =>
  Platform.OS === 'web' ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key);

// -------------------
// Async Thunks
// -------------------

// Load stored auth data on app launch
export const loadStoredAuth = createAsyncThunk(
  'auth/loadStoredAuth',
  async (_, { rejectWithValue }) => {
    try {
      const [token, userData] = await Promise.all([
        getStorageItem(TOKEN_KEY),
        getStorageItem(USER_KEY),
      ]);
      if (token && userData) {
        return { token, user: JSON.parse(userData) as User };
      }
      return null;
    } catch (err) {
      if (typeof err === 'string') return rejectWithValue('Failed to load authentication data.');
    }
  }
);

// Request OTP (simulated)
export const requestOTP = createAsyncThunk(
  'auth/requestOTP',
  async (identifier: string, { rejectWithValue }) => {
    try {
      // Replace this with real API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // console.log('OTP requested for:', identifier);
      return identifier;
    } catch (err) {
      if (typeof err === 'string') {
        return rejectWithValue('Failed to send OTP.');
      }
    }
  }
);

// Verify OTP and store user/token
export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ identifier, otp }: { identifier: string; otp: string }, { rejectWithValue }) => {
    try {
      // Replace with real API verification
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (otp !== '123456') return rejectWithValue('Invalid OTP.');

      const user: User = {
        id: '1',
        phone: identifier.includes('@') ? undefined : identifier,
        email: identifier.includes('@') ? identifier : undefined,
        username: `player_${Math.random().toString(36).substring(2, 8)}`,
      };
      const token = 'mock_token_' + Date.now();

      // Store token and user
      await Promise.all([
        setStorageItem(TOKEN_KEY, token),
        setStorageItem(USER_KEY, JSON.stringify(user)),
      ]);

      return { token, user };
    } catch (err) {
      if (err) {
        return rejectWithValue('OTP verification failed.');
      }
    }
  }
);

// Sign out (optional)
export const signOut = createAsyncThunk('auth/signOut', async (_, { rejectWithValue }) => {
  try {
    await Promise.all([removeStorageItem(TOKEN_KEY), removeStorageItem(USER_KEY)]);
    return null;
  } catch (err) {
    if (typeof err === 'string') return rejectWithValue('Failed to sign out.');
  }
});

// -------------------
// Slice
// -------------------
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load stored auth
      .addCase(loadStoredAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        loadStoredAuth.fulfilled,
        (state, action: PayloadAction<{ token: string; user: User } | null>) => {
          if (action.payload) {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.isAuthenticated = true;
          }
          state.isLoading = false;
        }
      )
      .addCase(loadStoredAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Request OTP
      .addCase(requestOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestOTP.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(requestOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        verifyOTP.fulfilled,
        (state, action: PayloadAction<{ token: string; user: User }>) => {
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.isLoading = false;
          state.error = null;
        }
      )
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Sign out
      .addCase(signOut.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
