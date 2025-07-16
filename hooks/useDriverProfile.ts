// hooks/useDriverProfile.ts
import { useEffect, useState } from 'react';
import driverService from '../api/driverService';

export interface DriverProfile {
  id: number;
  name: string;
  email?: string;
  slug?: string;
  avatar_urls?: { [size: string]: string };
  // …add any other WP user fields you need
}

export default function useDriverProfile() {
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    driverService
      .getProfile()
      .then(data => setProfile(data))
      .catch(err => setError(err.message || 'Error'))
      .finally(() => setLoading(false));
  }, []);

  return { profile, loading, error };
}
