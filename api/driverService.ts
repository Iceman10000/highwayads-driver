// api/driverService.ts
import api from './apiClient';

export interface DriverTrip {
  id?: number;
  route: string;
  miles: number;
  earnings: number;
  trip_date?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  assignment?: number;
  impressions?: number;
  clicks?: number;
}

export async function fetchTrips(): Promise<DriverTrip[]> {
  const { data } = await api.get('/highwayads/v1/driver-trips');
  return Array.isArray(data) ? data : [];
}

export async function postTrips(batch: Omit<DriverTrip, 'id'>[]) {
  const { data } = await api.post('/highwayads/v1/driver-trip', batch);
  return data;
}

export async function postSingleTrip(t: Omit<DriverTrip, 'id'>) {
  return postTrips([t]);
}

export const driverService = {
  fetchTrips,
  postTrips,
  postSingleTrip,
};
