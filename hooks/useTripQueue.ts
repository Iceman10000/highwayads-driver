// hooks/useTripQueue.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useCallback, useEffect, useRef, useState } from 'react';
import { driverService, PostTripPayload } from '../api/driverService';
import { useAuth } from '../components/AuthProvider';
import { generateClientId } from '../utils/generateId';

export type TripQueueStatus = 'pending' | 'syncing' | 'sent' | 'failed';

export interface TripQueueItem {
  clientId: string;
  createdAt: number;
  payload: PostTripPayload;
  status: TripQueueStatus;
  lastError?: string;
  attempts: number;
  serverId?: number;
}

interface UseTripQueueOptions {
  autoFlush?: boolean;
  maxRetries?: number;
  flushIntervalMs?: number;
}

interface UseTripQueueReturn {
  queue: TripQueueItem[];
  adding: boolean;
  flushing: boolean;
  error: string | null;
  addTrip: (payload: PostTripPayload) => Promise<TripQueueItem>;
  addTripsBatch: (payloads: PostTripPayload[]) => Promise<TripQueueItem[]>;
  flush: () => Promise<void>;
  remove: (clientId: string) => Promise<void>;
  clear: () => Promise<void>;
}

const QUEUE_KEY = 'driverTripQueue';
type IntervalHandle = ReturnType<typeof setInterval>;

export function useTripQueue(
  opts: UseTripQueueOptions = {}
): UseTripQueueReturn {
  const {
    autoFlush = true,
    maxRetries = 5,
    flushIntervalMs = 30_000,
  } = opts;

  const { token } = useAuth();

  const [queue, setQueue] = useState<TripQueueItem[]>([]);
  const [adding, setAdding] = useState(false);
  const [flushing, setFlushing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onlineRef = useRef<boolean>(true);
  const intervalRef = useRef<IntervalHandle | null>(null);

  /* ---------- Persistence ---------- */
  const persist = useCallback(async (next: TripQueueItem[]) => {
    setQueue(next);
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      if (raw) {
        const parsed: TripQueueItem[] = JSON.parse(raw);
        setQueue(parsed);
      }
    } catch {}
  }, []);

  /* ---------- Add Single ---------- */
  const addTrip = useCallback(async (payload: PostTripPayload) => {
    setAdding(true);
    try {
      const item: TripQueueItem = {
        clientId: generateClientId(),
        createdAt: Date.now(),
        payload,
        status: 'pending',
        attempts: 0,
      };
      const next = [...queue, item];
      await persist(next);
      return item;
    } finally {
      setAdding(false);
    }
  }, [queue, persist]);

  /* ---------- Add Batch ---------- */
  const addTripsBatch = useCallback(async (payloads: PostTripPayload[]) => {
    setAdding(true);
    try {
      const newItems: TripQueueItem[] = payloads.map(p => ({
        clientId: generateClientId(),
        createdAt: Date.now(),
        payload: p,
        status: 'pending',
        attempts: 0,
      }));
      await persist([...queue, ...newItems]);
      return newItems;
    } finally {
      setAdding(false);
    }
  }, [queue, persist]);

  /* ---------- Flush (define BEFORE effects that use it) ---------- */
  const flush = useCallback(async () => {
    if (!token) return;
    if (flushing) return;

    const candidates = queue.filter(
      q =>
        (q.status === 'pending' || q.status === 'failed') &&
        q.attempts < maxRetries
    );
    if (!candidates.length) return;

    setFlushing(true);
    setError(null);

    const syncingIds = new Set(candidates.map(c => c.clientId));

    let working: TripQueueItem[] = queue.map(q =>
      syncingIds.has(q.clientId)
        ? { ...q, status: 'syncing' as const }
        : q
    );
    await persist(working);

    try {
      const payloadBatch = candidates.map(c => c.payload);
      const res = await driverService.postTrips(payloadBatch);
      const idsReturned: number[] = Array.isArray(res?.ids) ? res.ids : [];

      let idx = 0;
      working = working.map(q => {
        if (syncingIds.has(q.clientId)) {
          const serverId = idsReturned[idx];
          idx++;
            if (serverId) {
              return {
                ...q,
                status: 'sent' as const,
                serverId,
                attempts: q.attempts + 1,
                lastError: undefined,
              };
            }
            return {
              ...q,
              status: 'failed' as const,
              attempts: q.attempts + 1,
              lastError: 'Server did not return ID',
            };
        }
        return q;
      });

      const pruned = working.filter(q => q.status !== 'sent');
      await persist(pruned);
    } catch (e: any) {
      const failed = working.map(q =>
        syncingIds.has(q.clientId)
          ? {
              ...q,
              status: 'failed' as const,
              attempts: q.attempts + 1,
              lastError: e?.message || 'Flush error',
            }
          : q
      );
      await persist(failed);
      setError(e?.message || 'Flush failed');
    } finally {
      setFlushing(false);
    }
  }, [token, flushing, queue, maxRetries, persist]);

  /* ---------- Init / Net status (now AFTER flush is declared) ---------- */
  useEffect(() => {
    load();
    const unsub = NetInfo.addEventListener(state => {
      const isOnline = !!state.isConnected && !!state.isInternetReachable;
      onlineRef.current = isOnline;
      if (isOnline && autoFlush) {
        flush();
      }
    });
    return () => unsub();
  }, [load, autoFlush, flush]);

  /* ---------- Periodic Flush Timer ---------- */
  useEffect(() => {
    if (!autoFlush) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (
        onlineRef.current &&
        token &&
        queue.some(q => q.status === 'pending' || q.status === 'failed')
      ) {
        flush();
      }
    }, flushIntervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [autoFlush, flushIntervalMs, token, queue, flush]);

  /* ---------- Remove / Clear ---------- */
  const remove = useCallback(async (clientId: string) => {
    await persist(queue.filter(q => q.clientId !== clientId));
  }, [queue, persist]);

  const clear = useCallback(async () => {
    await persist([]);
  }, [persist]);

  return {
    queue,
    adding,
    flushing,
    error,
    addTrip,
    addTripsBatch,
    flush,
    remove,
    clear,
  };
}
