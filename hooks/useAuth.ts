import { UpdateProfilePayload } from '../api/authApi';
import {
  doUpdateProfile,
  doUploadAvatar,
  doVerifyOtp,
  hydrateAuth,
  logout,
  requestOtp,
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
    uploadAvatar: (formData: FormData) => dispatch(doUploadAvatar(formData)),
  };
}
