// api/apiClient.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosHeaders, InternalAxiosRequestConfig } from 'axios';

export const API_BASE = 'https://highwayads.net/wp-json';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Ensure headers is an AxiosHeaders instance (or compatible)
  if (!config.headers) {
    config.headers = new AxiosHeaders();           // ← avoids the type error
  }

  if (authToken) {
    (config.headers as AxiosHeaders).set('Authorization', `Bearer ${authToken}`);
  } else {
    // Fallback read (should rarely be needed)
    try {
      const stored = await AsyncStorage.getItem('jwtToken');
      if (stored) {
        (config.headers as AxiosHeaders).set('Authorization', `Bearer ${stored}`);
      }
    } catch {}
  }

  return config;
});

export default api;
