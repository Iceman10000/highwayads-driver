// api/apiClient.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { Platform } from 'react-native';

/* =========================================================
   CONFIG
========================================================= */
const API_BASE = 'https://highwayads.net/wp-json'; // trailing slash not required

// Keys for cached summary (ETag + payload)
const SUMMARY_ETAG_KEY = 'driverSummaryEtag';
const SUMMARY_CACHE_KEY = 'driverSummaryCache';

// Reasonable timeout (ms)
const REQUEST_TIMEOUT = 15000;

/* =========================================================
   IN-MEMORY STATE
========================================================= */
let inMemoryToken: string | null = null;
let summaryEtag: string | null = null;
let summaryCache: any | null = null;
let logoutHandler: (() => void) | null = null;

/* =========================================================
   PUBLIC HELPERS
========================================================= */
export function setAuthToken(token: string | null) {
  inMemoryToken = token;
}

export function registerLogoutHandler(fn: () => void) {
  logoutHandler = fn;
}

/**
 * Prime ETag + summary cache from persistent storage
 * Call once early (e.g. in root layout or AuthProvider mount).
 */
export async function primeSummaryCacheFromStorage() {
  try {
    const [etag, cached] = await Promise.all([
      AsyncStorage.getItem(SUMMARY_ETAG_KEY),
      AsyncStorage.getItem(SUMMARY_CACHE_KEY),
    ]);
    summaryEtag = etag;
    if (cached) {
      try {
        summaryCache = JSON.parse(cached);
      } catch {
        summaryCache = null;
      }
    }
  } catch {
    /* ignore */
  }
}

/* =========================================================
   AXIOS INSTANCE
========================================================= */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: REQUEST_TIMEOUT,
});

/* =========================================================
   REQUEST INTERCEPTOR
========================================================= */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Attach token
    if (!inMemoryToken) {
      // Fallback: read from storage (costly, but only if memory empty)
      const stored =
        (await AsyncStorage.getItem('jwtToken').catch(() => null)) ||
        (Platform.OS === 'web'
          ? (() => {
              try {
                return localStorage.getItem('jwtToken');
              } catch {
                return null;
              }
            })()
          : null);
      if (stored) inMemoryToken = stored;
    }
    if (inMemoryToken) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }

    // ETag for summary endpoint
    if (
      config.url &&
      config.method?.toLowerCase() === 'get' &&
      config.url.includes('/highwayads/v1/driver/summary') &&
      summaryEtag
    ) {
      config.headers['If-None-Match'] = summaryEtag;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================================================
   RESPONSE INTERCEPTOR
========================================================= */
api.interceptors.response.use(
  (response) => {
    // Capture summary ETag & cache body
    if (response.config.url?.includes('/highwayads/v1/driver/summary')) {
      const etag = response.headers['etag'];
      if (etag) {
        summaryEtag = etag;
        AsyncStorage.setItem(SUMMARY_ETAG_KEY, etag).catch(() => {});
      }
      summaryCache = response.data;
      AsyncStorage.setItem(
        SUMMARY_CACHE_KEY,
        JSON.stringify(response.data)
      ).catch(() => {});
    }
    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    const config = error.config as AxiosRequestConfig & { _retry?: boolean };

    // 304 Not Modified for summary → serve cached
    if (
      status === 304 &&
      config.url?.includes('/driver/summary') &&
      summaryCache
    ) {
      return {
        ...error.response,
        status: 200,
        data: summaryCache,
        config,
        headers: error.response?.headers || {},
      } as any;
    }

    // Unauthorized → purge token + invoke logout handler
    if (status === 401 && inMemoryToken) {
      inMemoryToken = null;
      await AsyncStorage.removeItem('jwtToken').catch(() => {});
      if (Platform.OS === 'web') {
        try {
          localStorage.removeItem('jwtToken');
        } catch {}
      }
      logoutHandler?.();
    }

    // Simple retry for transient GET network errors (no status)
    if (!status && config?.method === 'get' && !config._retry) {
      config._retry = true;
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
