// components/AuthProvider.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import api, { setAuthToken } from '../api/apiClient';

/* =========================================================
   CONFIG
   ========================================================= */
const PERSIST_TOKEN = false;              // <- toggle to true if you want "remember me" later
const MAX_IDLE_MS = 30 * 60 * 1000;       // 30 min inactivity window
const WARNING_LEAD_MS = 2 * 60 * 1000;    // warn 2 min before auto logout
const IDLE_FALLBACK_CHECK_MS = 5 * 60 * 1000; // safety interval

/* =========================================================
   TYPES
   ========================================================= */
interface AuthContextType {
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; token?: string; errorMessage?: string }>;
  logout: (reason?: string) => Promise<void>;
  touchActivity: () => void;
  // Idle warning UI
  showIdleWarning: boolean;
  dismissIdleWarning: () => void;
}

/* =========================================================
   CONTEXT
   ========================================================= */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
/* =========================================================
   PROVIDER
   ========================================================= */
export function AuthProvider({ children }: { children: ReactNode }) {
  /* ---------- State ---------- */
  const [token, _setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);         // initial splash / rehydrate gate
  const [showIdleWarning, setShowIdleWarning] = useState(false);

  /* ---------- Refs ---------- */
  const tokenRef = useRef<string | null>(null);
  const loginInFlightRef = useRef<Promise<any> | null>(null);
  const rehydratedRef = useRef(false);

  const lastActivityRef = useRef<number>(Date.now());
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  /* =========================================================
     TOKEN MGMT
     ========================================================= */
  const setToken = useCallback((next: string | null, reason: string) => {
    if (tokenRef.current === next) return;
    tokenRef.current = next;
    console.log(
      '🔐 AuthProvider – token changed →',
      next ? next.slice(0, 25) + '…' : 'null',
      `(${reason})`
    );
    _setToken(next);
    setAuthToken(next);

    if (PERSIST_TOKEN && Platform.OS === 'web') {
      try {
        if (next) localStorage.setItem('jwtToken', next);
        else localStorage.removeItem('jwtToken');
      } catch {}
    }
  }, []);

  /* =========================================================
     TIMER HELPERS
     ========================================================= */
  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = null;
  }, []);

  const clearWarningTimer = useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    warningTimerRef.current = null;
  }, []);

  const scheduleIdleAndWarning = useCallback(() => {
    clearIdleTimer();
    clearWarningTimer();
    setShowIdleWarning(false);
    if (!tokenRef.current) return;

    const warnAt = Math.max(0, MAX_IDLE_MS - WARNING_LEAD_MS);

    // schedule warning
    warningTimerRef.current = setTimeout(() => {
      const idleFor = Date.now() - lastActivityRef.current;
      if (
        tokenRef.current &&
        idleFor >= warnAt - 250 &&
        idleFor < MAX_IDLE_MS
      ) {
        setShowIdleWarning(true);
      }
    }, warnAt);

    // schedule logout
    idleTimerRef.current = setTimeout(() => {
      const idleFor = Date.now() - lastActivityRef.current;
      if (idleFor >= MAX_IDLE_MS && tokenRef.current) {
        console.log('⏰ Auto-logout (idle)');
        logoutInternal('idle');
      } else {
        scheduleIdleAndWarning(); // race safety
      }
    }, MAX_IDLE_MS);
  }, [clearIdleTimer, clearWarningTimer]);

  /* =========================================================
     ACTIVITY
     ========================================================= */
  const touchActivity = useCallback(() => {
    if (!tokenRef.current) return;
    lastActivityRef.current = Date.now();
    if (showIdleWarning) setShowIdleWarning(false);
    scheduleIdleAndWarning();
  }, [scheduleIdleAndWarning, showIdleWarning]);

  const dismissIdleWarning = useCallback(() => {
    setShowIdleWarning(false);
    touchActivity();
  }, [touchActivity]);

  /* =========================================================
     LOGOUT
     ========================================================= */
  const logoutInternal = useCallback(
    async (reason: string = 'manual') => {
      clearIdleTimer();
      clearWarningTimer();
      setShowIdleWarning(false);
      const existing = tokenRef.current;

      if (existing) {
        try { await api.post('/jwt-auth/v1/token/revoke'); } catch {}
      }

      // Always clean local storage (even if persistence off) to purge legacy stash
      await AsyncStorage.removeItem('jwtToken').catch(() => {});
      if (Platform.OS === 'web') {
        try { localStorage.removeItem('jwtToken'); } catch {}
      }

      setToken(null, `logout-${reason}`);
    },
    [setToken, clearIdleTimer, clearWarningTimer]
  );

  const logout = logoutInternal;

  /* =========================================================
     LOGIN
     ========================================================= */
  const login = useCallback(
    async (username: string, password: string) => {
      if (loginInFlightRef.current) return loginInFlightRef.current;

      const p = (async () => {
        try {
          console.log('[login] attempt', { username });

          const { data, headers, status } = await api.post(
            '/jwt-auth/v1/token',
            { username: username.trim(), password }
          );

          console.log('[login] response status', status);
          if (data?.token) {
            if (PERSIST_TOKEN) {
              await AsyncStorage.setItem('jwtToken', data.token);
              if (Platform.OS === 'web') {
                try { localStorage.setItem('jwtToken', data.token); } catch {}
              }
            }
            setToken(data.token, 'login');
            lastActivityRef.current = Date.now();
            scheduleIdleAndWarning();
            return { success: true, token: data.token };
          }

          const msg = typeof data?.message === 'string'
            ? data.message
            : 'Invalid credentials';
          return { success: false, errorMessage: msg };
        } catch (err: any) {
          const errMsg =
            err?.response?.data?.message ||
            err?.response?.data ||
            err?.message ||
            'Unknown error';
          console.log('[login] error detail:', err?.response?.data || err);
          return { success: false, errorMessage: String(errMsg) };
        } finally {
          loginInFlightRef.current = null;
        }
      })();

      loginInFlightRef.current = p;
      return p;
    },
    [scheduleIdleAndWarning, setToken]
  );

  /* =========================================================
     NO REHYDRATE (Persistence Disabled)
     =========================================================
     We explicitly *do not* read stored token. If any leftover token
     exists from previous builds, purge it once and show login.
  */
  useEffect(() => {
    if (rehydratedRef.current) return;
    rehydratedRef.current = true;
    (async () => {
      try {
        await AsyncStorage.removeItem('jwtToken').catch(() => {});
        if (Platform.OS === 'web') {
          try { localStorage.removeItem('jwtToken'); } catch {}
        }
      } finally {
        setLoading(false); // show login UI
      }
    })();
  }, []);

  /* =========================================================
     APP STATE (native foreground = activity)
     ========================================================= */
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = AppState.addEventListener('change', next => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      if (prev.match(/inactive|background/) && next === 'active') {
        touchActivity();
      }
    });
    return () => sub.remove();
  }, [touchActivity]);

  /* =========================================================
     WEB ACTIVITY EVENTS
     ========================================================= */
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!token) return;

    const winEvents: (keyof WindowEventMap)[] = [
      'mousemove',
      'keydown',
      'click',
      'scroll',
      'touchstart',
      'focus',
    ];
    const handler = () => {
      if (document.hidden) return;
      touchActivity();
    };

    winEvents.forEach(e => window.addEventListener(e, handler, { passive: true }));
    document.addEventListener('visibilitychange', handler, { passive: true });

    return () => {
      winEvents.forEach(e => window.removeEventListener(e, handler));
      document.removeEventListener('visibilitychange', handler);
    };
  }, [token, touchActivity]);

  /* =========================================================
     FALLBACK PERIODIC CHECK
     ========================================================= */
  useEffect(() => {
    if (!token) return;
    const id = setInterval(() => {
      const idleFor = Date.now() - lastActivityRef.current;
      if (idleFor >= MAX_IDLE_MS && tokenRef.current) {
        console.log('⏰ Auto-logout (fallback)');
        logoutInternal('idle-fallback');
      }
    }, IDLE_FALLBACK_CHECK_MS);
    return () => clearInterval(id);
  }, [token, logoutInternal]);

  /* =========================================================
     TOKEN CHANGE SIDE EFFECT
     ========================================================= */
  useEffect(() => {
    if (token) {
      lastActivityRef.current = Date.now();
      scheduleIdleAndWarning();
    } else {
      clearIdleTimer();
      clearWarningTimer();
      setShowIdleWarning(false);
    }
  }, [token, scheduleIdleAndWarning, clearIdleTimer, clearWarningTimer]);

  /* =========================================================
     CONTEXT VALUE
     ========================================================= */
  const ctx: AuthContextType = {
    token,
    loading,
    login,
    logout,
    touchActivity,
    showIdleWarning,
    dismissIdleWarning,
  };

  if (loading) return null; // or splash screen
  return <AuthContext.Provider value={ctx}>{children}</AuthContext.Provider>;
}
