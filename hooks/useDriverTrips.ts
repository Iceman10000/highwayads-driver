// hooks/useDriverTrips.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { driverService, PaginatedTrips, Trip } from '../api/driverService';
import { useAuth } from '../components/AuthProvider';

export interface TripFilters {
  date_from?: string;
  date_to?: string;
}

interface UseDriverTripsOptions {
  perPage?: number;
  autoLoad?: boolean;
  initialFilters?: TripFilters;
}

interface UseDriverTripsReturn {
  trips: Trip[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  total: number;
  filters: TripFilters;
  setFilters: (f: TripFilters) => void;
  refresh: () => Promise<void>;
  loadMore: () => void;
  appendTripOptimistic: (t: Trip) => void;
  clear: () => void;
}

export function useDriverTrips(
  options: UseDriverTripsOptions = {}
): UseDriverTripsReturn {
  const { token } = useAuth();
  const {
    perPage = 50,
    autoLoad = true,
    initialFilters = {},
  } = options;

  const [trips, setTrips] = useState<Trip[]>([]);
  const [filters, setFiltersState] = useState<TripFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Avoid race overwrites
  const activeRequestRef = useRef<number>(0);

  const mergeTrips = useCallback((incoming: Trip[], replace: boolean) => {
    setTrips(prev => {
      if (replace) return incoming;
      const map = new Map<number, Trip>();
      prev.forEach(t => map.set(t.id, t));
      incoming.forEach(t => map.set(t.id, t));
      return Array.from(map.values()).sort(
        (a, b) => (new Date(b.date).getTime()) - (new Date(a.date).getTime())
      );
    });
  }, []);

  const loadPage = useCallback(async (p: number, replace = false) => {
    if (!token) return;
    const reqId = ++activeRequestRef.current;
    setLoading(true);
    setError(null);
    try {
      const res: PaginatedTrips = await driverService.getTrips({
        page: p,
        per_page: perPage,
        ...filters,
      });
      if (reqId !== activeRequestRef.current) return; // stale
      mergeTrips(res.trips, replace);
      setPage(res.page);
      setTotalPages(res.total_pages);
      setTotal(res.total);
    } catch (e: any) {
      setError(e.message || 'Failed to load trips');
    } finally {
      if (reqId === activeRequestRef.current) setLoading(false);
    }
  }, [token, perPage, filters, mergeTrips]);

  const refresh = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      await loadPage(1, true);
    } finally {
      setRefreshing(false);
    }
  }, [token, loadPage]);

  const loadMore = useCallback(() => {
    if (loading) return;
    if (page >= totalPages) return;
    loadPage(page + 1);
  }, [loading, page, totalPages, loadPage]);

  // Adjust filters & refetch
  const setFilters = useCallback((f: TripFilters) => {
    setFiltersState(f);
    // reset chain
    setPage(1);
  }, []);

  // Auto-load on mount / token / filters change
  useEffect(() => {
    if (token && autoLoad) {
      // Replace list
      loadPage(1, true);
    }
  }, [token, filters, autoLoad, loadPage]);

  // Optimistic append (e.g. after offline queue flush)
  const appendTripOptimistic = useCallback((trip: Trip) => {
    setTrips(prev => {
      if (prev.some(t => t.id === trip.id)) return prev;
      return [trip, ...prev].sort(
        (a, b) => (new Date(b.date).getTime()) - (new Date(a.date).getTime())
      );
    });
  }, []);

  const clear = useCallback(() => {
    setTrips([]);
    setPage(1);
    setTotal(0);
    setTotalPages(1);
  }, []);

  return {
    trips,
    loading,
    refreshing,
    error,
    page,
    totalPages,
    total,
    filters,
    setFilters,
    refresh,
    loadMore,
    appendTripOptimistic,
    clear,
  };
}
