// api/driverService.ts
import api from './apiClient';

/* =========================================================
   TYPES
========================================================= */
export interface Assignment {
  id: number;
  title: string;
  status: string;
  tier: string;
  active: boolean;
  updatedAt: string;
}

export interface DriverSummary {
  user: { id: number; name: string; role: string };
  metrics: {
    assignmentsActive: number;
    milesToday: number;
    impressionsToday: number;
    earningsToday: number;
  };
  assignmentTiers: string[];
  assignmentsSample?: Assignment[];
  packagesPending: number;
  serverTime: string;
}

export interface Trip {
  id: number;
  route: string;
  miles: number;
  earnings: number;
  date: string;
  status: string;
  assignment: number;
  impressions: number;
  clicks: number;
}

export interface PaginatedTrips {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  trips: Trip[];
}

export interface PostTripPayload {
  route?: string;
  miles?: number;
  earnings?: number;
  trip_date?: string;   // 'YYYY-MM-DD'
  start_date?: string;
  end_date?: string;
  status?: string;
  assignment?: number;
  impressions?: number;
  clicks?: number;
}

/* =========================================================
   SERVICE METHODS
========================================================= */

const BASE_NS = '/highwayads/v1';

export const driverService = {
  /* ---- Summary ---- */
  getSummary: async (): Promise<DriverSummary> => {
    const { data } = await api.get(`${BASE_NS}/driver/summary`);
    return data;
  },

  /* ---- Assignments ---- */
  getAssignments: async (): Promise<Assignment[]> => {
    const { data } = await api.get(`${BASE_NS}/driver/assignments`);
    return data.assignments || [];
  },

  /* ---- Pending packages (optional, if you need separate) ---- */
  getPendingPackages: async (): Promise<{
    pendingCount: number;
    pending: Array<{ id: number; title: string; status: string }>;
  }> => {
    const { data } = await api.get(`${BASE_NS}/driver/packages`);
    return {
      pendingCount: data.pendingCount ?? 0,
      pending: data.pending || [],
    };
  },

  /* ---- Trips (paginated) ---- */
  getTrips: async (
    params?: { page?: number; per_page?: number; date_from?: string; date_to?: string }
  ): Promise<PaginatedTrips> => {
    const { data } = await api.get(`${BASE_NS}/driver-trips`, { params });
    return data;
  },

  /* ---- Post single or batch trips ---- */
  postTrips: async (trips: PostTripPayload | PostTripPayload[]) => {
    const payload = Array.isArray(trips) ? trips : [trips];
    const { data } = await api.post(`${BASE_NS}/driver-trip`, payload);
    return data; // { success, ids, count }
  },

  /* ---- Convenience: append single trip (returns inserted ID or null) ---- */
  postTrip: async (trip: PostTripPayload): Promise<number | null> => {
    const res = await driverService.postTrips(trip);
    if (res?.success && Array.isArray(res.ids) && res.ids.length) {
      return res.ids[0];
    }
    return null;
  },
};

/* =========================================================
   OPTIONAL: TYPE GUARDS / HELPERS
========================================================= */

/**
 * Quick type guard if needed before using summary data.
 */
export function isDriverSummary(obj: any): obj is DriverSummary {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.metrics &&
    typeof obj.metrics.milesToday === 'number'
  );
}
