// hooks/useAuth.ts
import {
  bootstrapAuth,
  logout,
  requestOtp,
  updateProfile,
  verifyOtp,
} from '../app/redux/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../app/redux/slices/hooks';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { token, user, loading, error, bootstrapped } = useAppSelector((s) => s.auth);

  return {
    token,
    user,
    loading,
    error,
    bootstrapped,

    requestOtp: (email: string) => dispatch(requestOtp(email)),
    verifyOtp: (userIdentifier: string, code: string) =>
      dispatch(verifyOtp({ userIdentifier, code })),
    logout: () => dispatch(logout()),
    bootstrapAuth: () => dispatch(bootstrapAuth()),
    updateProfile: (updates: { displayName?: string; avatarUrl?: string }) =>
      dispatch(updateProfile(updates)),
    isAuthenticated: Boolean(token),
  };
}
