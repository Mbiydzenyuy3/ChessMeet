// ============================ store/authSlice.ts ============================
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchMe, verifyOtp } from '../lib/auth';
import { saveToken, clearToken, getToken } from '../lib/storage';

export type AuthState = {
  token: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any | null;
  loading: boolean;
  error?: string;
};

const initialState: AuthState = { token: null, user: null, loading: false };

export const hydrateAuth = createAsyncThunk('auth/hydrate', async () => {
  const t = await getToken();
  if (!t) return { token: null, user: null };
  const me = await fetchMe();
  return { token: t, user: me };
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

export const logout = createAsyncThunk('auth/logout', async () => {
  await clearToken();
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
    b.addCase(hydrateAuth.rejected, (s, a) => {
      s.loading = false;
      s.error = String(a.error.message || '');
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

    b.addCase(logout.fulfilled, (s) => {
      s.token = null;
      s.user = null;
    });
  },
});

export default slice.reducer;
