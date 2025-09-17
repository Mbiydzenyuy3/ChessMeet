import { UpdateProfilePayload } from '../api/authApi';
import {
  doUpdateProfile,
  doVerifyOtp,
  hydrateAuth,
  logout,
  requestOtp,
  uploadAvatar,
} from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/index';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { token, user, profileLoading, avatarLoading, error } = useAppSelector((s) => s.auth);

  return {
    token,
    user,
    profileLoading,
    avatarLoading,
    error,
    isAuthenticated: Boolean(token),

    requestOtp: (email: string) => dispatch(requestOtp(email)),
    verifyOtp: (userIdentifier: string, code: string) =>
      dispatch(doVerifyOtp({ userIdentifier, code })),

    logout: () => dispatch(logout()),
    bootstrapAuth: () => dispatch(hydrateAuth()),

    updateProfile: (updates: UpdateProfilePayload) => dispatch(doUpdateProfile(updates)),
    uploadAvatar: (formData: FormData) => dispatch(uploadAvatar(formData)),
  };
}
