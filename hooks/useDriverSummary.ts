// hooks/useDriverSummary.ts
import { useCallback, useEffect, useState } from 'react';
import { driverService, DriverSummary } from '../api/driverService';
import { useAuth } from '../components/AuthProvider';

export function useDriverSummary() {
  const { token } = useAuth();
  const [data, setData] = useState<DriverSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await driverService.getSummary();
      setData(res);
    } catch (e: any) {
      setError(e.message || 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
