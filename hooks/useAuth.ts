// hooks/useAuth.ts
import { logout, requestOtp, verifyOtp } from '../redux/slices/authSlice';
import { useAppDispatch, useAppSelector } from './../redux/slices/hooks';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { token, user, loading, error } = useAppSelector((s) => s.auth);

  return {
    token,
    user,
    loading,
    error,
    requestOtp: (email: string) => dispatch(requestOtp(email)),
    verifyOtp: (userIdentifier: string, code: string) =>
      dispatch(verifyOtp({ userIdentifier, code })),
    logout: () => dispatch(logout()),
    isAuthenticated: Boolean(token),
  };
}
