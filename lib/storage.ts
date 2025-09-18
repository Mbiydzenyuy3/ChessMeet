// /* eslint-disable no-empty */
// // ============================ lib/storage.ts ============================
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as SecureStore from 'expo-secure-store';

// const KEY = 'chessmeet.jwt';

// export async function saveToken(token: string) {
//   try {
//     await SecureStore.setItemAsync(KEY, token);
//     console.log('token sauve succesfully SecureStore');
//   } catch {
//     await AsyncStorage.setItem(KEY, token);
//     console.log('token sauve succesfully AsyncStorage');
//   }
// }

// export async function getToken(): Promise<string | null> {
//   try {
//     const v = await SecureStore.getItemAsync(KEY);
//     if (v) return v;
//   } catch {}
//   return AsyncStorage.getItem(KEY);
// }

// export async function clearToken() {
//   try {
//     await SecureStore.deleteItemAsync(KEY);
//   } catch {}
//   await AsyncStorage.removeItem(KEY);
// }

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'chessmeet.jwt';

/**
 * Saves the authentication token to the appropriate storage based on the platform.
 * Uses SecureStore for native (iOS/Android) and AsyncStorage for web.
 */
export async function saveToken(token: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      // Use standard AsyncStorage for web
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      // Use SecureStore for native for better security
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Failed to save the auth token:', error);
  }
}

/**
 * Retrieves the authentication token from the appropriate storage.
 */
export async function getToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Failed to get the auth token:', error);
    return null;
  }
}

/**
 * Clears the authentication token from storage.
 */
export async function clearToken(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Failed to clear the auth token:', error);
  }
}
