// hooks/useDriverTrips.ts
import { useCallback, useEffect, useState } from 'react';
import { driverService, DriverTrip } from '../api/driverService';
import { useAuth } from '../components/AuthProvider';

export function useDriverTrips() {
  const { token } = useAuth();
  const [trips, setTrips] = useState<DriverTrip[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await driverService.fetchTrips();
      setTrips(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const refresh = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      const data = await driverService.fetchTrips();
      setTrips(data);
    } catch (e: any) {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    trips,
    loading,
    error,
    refreshing,
    refresh,
  };
}
