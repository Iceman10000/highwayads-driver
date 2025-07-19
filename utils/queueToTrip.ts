import { Trip } from '@/api/driverService';
import { TripQueueItem } from '@/hooks/useTripQueue';

export function queueItemToTrip(item: TripQueueItem, fallbackId?: number): Trip {
  const id =
    item.serverId ??
    fallbackId ??
    -Math.floor(Math.random() * 1e9); // negative temporary ID

  const date =
    item.payload.trip_date || new Date().toISOString().slice(0, 10);

  return {
    id,
    route: item.payload.route || '—',
    miles: item.payload.miles ?? 0,
    earnings: item.payload.earnings ?? 0,
    date,
    status: item.payload.status || 'Active',
    assignment: item.payload.assignment ?? 0,
    impressions: item.payload.impressions ?? 0,
    clicks: item.payload.clicks ?? 0,
  };
}
