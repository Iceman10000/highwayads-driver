/**
 * TrackingContext
 * ------------------------------------------------------------------
 * Keeps global state for:
 *  – whether we’re tracking / paused / idle
 *  – the “live” trip currently being recorded
 *  – the list of finished trips (persisted in Async‑Storage)
 * ------------------------------------------------------------------
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto'; // generates UUID fall‑back for web
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type TrackingState = 'idle' | 'tracking' | 'paused';

export interface TripPoint {
  latitude: number;
  longitude: number;
  timestamp: number; // epoch ms
}

export interface TripSummary {
  id: string;
  startedAt: number;
  endedAt?: number;
  points: TripPoint[];
}

/** the bit of state managed by the reducer */
interface StoreState {
  state: TrackingState;
  currentTrip?: TripSummary;
  trips: TripSummary[];
}

type Action =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'FINISH'; payload: TripPoint[] };

interface ContextShape extends StoreState {
  startTracking(): void;
  pauseTracking(): void;
  resumeTracking(): void;
  finishTracking(finalPoints: TripPoint[]): void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

// Tiny UUID helper that works everywhere
const uuid = () =>
  (globalThis.crypto?.randomUUID ?? Crypto.randomUUID)();

/* ------------------------------------------------------------------ */
/*  Reducer                                                           */
/* ------------------------------------------------------------------ */

function reducer(prev: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'START': {
      const newTrip: TripSummary = {
        id: uuid(),
        startedAt: Date.now(),
        points: [],
      };
      return { ...prev, state: 'tracking', currentTrip: newTrip };
    }
    case 'PAUSE':
      return { ...prev, state: 'paused' };

    case 'RESUME':
      return { ...prev, state: 'tracking' };

    case 'FINISH': {
      if (!prev.currentTrip) return prev; // nothing to finish
      const finished: TripSummary = {
        ...prev.currentTrip,
        endedAt: Date.now(),
        points: action.payload,
      };
      return {
        state: 'idle',
        currentTrip: undefined,
        trips: [...prev.trips, finished],
      };
    }
    default:
      return prev;
  }
}

/* ------------------------------------------------------------------ */
/*  Context provider                                                  */
/* ------------------------------------------------------------------ */

const TrackingContext = createContext<ContextShape | undefined>(undefined);

export const TrackingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // ---------------- initial (empty) store ----------------
  const [store, dispatch] = useReducer(reducer, {
    state: 'idle',
    trips: [],
  } as StoreState);

  /* ---------- load persisted trips once on mount ---------- */
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('@trips');
      if (raw) {
        try {
          const parsed: TripSummary[] = JSON.parse(raw);
          // we cheat by dispatching FINISH with an empty payload to
          // “seed” the reducer — simpler than a dedicated action
          parsed.forEach((trip) =>
            dispatch({ type: 'FINISH', payload: trip.points })
          );
        } catch {}
      }
    })();
  }, []);

  /* ---------- persist trips whenever they change ---------- */
  useEffect(() => {
    AsyncStorage.setItem('@trips', JSON.stringify(store.trips));
  }, [store.trips]);

  /* ---------- memoised API exposed to the app ---------- */
  const api = useMemo<ContextShape>(
    () => ({
      ...store,
      startTracking: () => dispatch({ type: 'START' }),
      pauseTracking: () => dispatch({ type: 'PAUSE' }),
      resumeTracking: () => dispatch({ type: 'RESUME' }),
      finishTracking: (pts) => dispatch({ type: 'FINISH', payload: pts }),
    }),
    [store]
  );

  return (
    <TrackingContext.Provider value={api}>
      {children}
    </TrackingContext.Provider>
  );
};

/* Hook for components */
export const useTracking = () => {
  const ctx = useContext(TrackingContext);
  if (!ctx) throw new Error('useTracking must be inside TrackingProvider');
  return ctx;
};
