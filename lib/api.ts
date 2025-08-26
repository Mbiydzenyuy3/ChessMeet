// ============================ lib/api.ts ============================
import axios from 'axios';
import { ENV } from './env';
import { getToken } from './storage';

export const api = axios.create({ baseURL: ENV.BASE_URL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  console.log(`token pur la requete api ${token}`);
  if (token) {
    config.headers = config.headers || {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (config.headers as any)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiError = { message?: string } & Record<string, any>;
