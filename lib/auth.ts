/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================ lib/auth.ts ============================
import { api } from './api';


export async function requestOtp(email: string) {
const { data } = await api.post('/auth/request-otp', { email });
return data as { message: string };
}


export async function verifyOtp(userIdentifier: string, code: string) {
const { data } = await api.post('/auth/verify-otp', { userIdentifier, code });
return data as { accessToken: string; user: any };
}


export async function fetchMe() {
const { data } = await api.get('/user/me');
return data as any;
}


export async function updateMe(payload: { displayName?: string; avatarUrl?: string }) {
const { data } = await api.patch('/user/me', payload);
return data as any;
}