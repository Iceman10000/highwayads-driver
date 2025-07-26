// background/LocationTask.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

/**‑‐ The string Expo‑Location will use to look‑up the task. */
export const LOCATION_TASK = 'background‑location‑task';

/** Runtime shape of the data that gets delivered to the task. */
type LocationTaskData = { locations: Location.LocationObject[] };

TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) { console.error(error); return; }

  const { locations } = data as LocationTaskData;

  /* ▾ Append the newly‑received points to a queue in AsyncStorage. */
  const queue: Location.LocationObject[] =
    JSON.parse((await AsyncStorage.getItem('@queuedPoints')) ?? '[]');

  await AsyncStorage.setItem(
    '@queuedPoints',
    JSON.stringify([...queue, ...locations]),
  );
});

/* ------------------------------------------------------------------ */
/*  ONLY for expo‑router’s file‑based routing: make the warning go away
/*  if the file ever drifts back under `app/`.  It renders nothing.   */
export default function BackgroundLocationTask() { return null; }
