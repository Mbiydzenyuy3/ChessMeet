/* eslint-disable no-empty */
// ============================ lib/storage.ts ============================
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'chessmeet.jwt';

export async function saveToken(token: string) {
  try {
    await SecureStore.setItemAsync(KEY, token);
  } catch {
    await AsyncStorage.setItem(KEY, token);
  }
}

export async function getToken(): Promise<string | null> {
  try {
    const v = await SecureStore.getItemAsync(KEY);
    if (v) return v;
  } catch {}
  return AsyncStorage.getItem(KEY);
}

export async function clearToken() {
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch {}
  await AsyncStorage.removeItem(KEY);
}
