/**
 * app/_layout.tsx  –– top-level navigation shell
 *   • wraps every screen with Auth- and Tracking-providers
 *   • registers the Expo background-location task **once**
 *   • hides the root header so we never see the automatic “(tabs)” bar
 *   • EDGE-TO-EDGE: SafeAreaProvider + SystemBars
 */
import * as Location from 'expo-location';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { LOCATION_TASK } from '../background/LocationTask';
import { AuthProvider } from '../components/AuthProvider';
import { TrackingProvider } from '../components/TrackingContext';

// ✅ Edge-to-edge additions
import { SystemBars } from 'react-native-edge-to-edge';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  /* ---------------------------------------------------------------
   * Start / confirm the background task the first time the app runs
   * ------------------------------------------------------------- */
  useEffect(() => {
    (async () => {
      const isRunning =
        await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);

      if (!isRunning) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK, {
          accuracy: Location.Accuracy.High,
          timeInterval: 30_000,               // 30 s in background
          distanceInterval: 10,               // 10 m in background
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: 'HighwayADS Driver',
            notificationBody: 'Tracking in background',
          },
        });
      }
    })();
  }, []);

  /* ------------------------------------------------------------------ */
  /* Navigation tree – root <Stack>                                    */
  /*            ↓ every screen in the app inherits from this stack      */
  /* ------------------------------------------------------------------ */
  return (
    // ✅ Provide safe-area metrics app-wide (for padding near system bars)
    <SafeAreaProvider>
      <AuthProvider>
        <TrackingProvider>
          {/* ✅ Draw system status/navigation bars with auto light/dark and
              Android 15-friendly behavior (no deprecated color APIs) */}
          <SystemBars style="auto" />

          <Stack
            screenOptions={{
              headerShown: false, // ⛔️ kill the auto “(tabs)” header
            }}
          />
        </TrackingProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
