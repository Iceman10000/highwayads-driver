/**
 * app/(tabs)/trip‑tracker.tsx
 * ───────────────────────────
 * • Visualises an *active* trip on a Google map
 * • Starts a high‑accuracy foreground watcher whenever the **global**
 *   tracking context === 'tracking'
 * • Keeps all points so far (for a <Polyline>) **and** the most‑recent
 *   point (for a moving <Marker>)
 * • The red “Pause” *and* the ◀︎ back‑arrow in the header both call
 *   `handlePause()` – stopping the watcher, updating context ➜ 'paused'
 *   and navigating home.
 */

import { HeaderBackButton } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View,
} from 'react-native';
import MapView, {
  Marker,
  Polyline,
  Region,
} from 'react-native-maps';

import ActionButton from '../../components/ActionButton';
import { useTracking } from '../../components/TrackingContext';

/* ------------------------------------------------------------------ */
/*                                UI                                  */
/* ------------------------------------------------------------------ */

export default function TripTracker() {
  /* ───────── navigation handles ───────── */
  const router      = useRouter();
  const navigation  = useNavigation();
  const mapRef      = useRef<MapView>(null);

  /* ───────── global tracking state ─────── */
  const { state, pauseTracking } = useTracking();
  // state : 'idle' | 'tracking' | 'paused'

  /* ───────── local screen state ────────── */
  const [points,       setPoints]       = useState<Location.LocationObject[]>([]);
  const [current,      setCurrent]      = useState<Location.LocationObject>();
  const [watcher,      setWatcher]      = useState<Location.LocationSubscription>();

  /* ════════════════════════════════════════════════════════════════
   * 1)  Start/stop foreground watcher depending on `state`
   * ════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    /** create high‑accuracy watcher */
    async function startWatching() {
      /* ask permission at runtime (Android & iOS 14+) */
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is needed.');
        return;
      }

      const sub = await Location.watchPositionAsync(
        {
          accuracy        : Location.Accuracy.Highest,
          timeInterval    : 3_000, // ms
          distanceInterval: 5,     // metres
        },
        (loc) => {
          setCurrent(loc);                      // marker
          setPoints((prev) => [...prev, loc]);  // polyline

          /* centre map on new point */
          mapRef.current?.animateToRegion({
            latitude      : loc.coords.latitude,
            longitude     : loc.coords.longitude,
            latitudeDelta : 0.005,
            longitudeDelta: 0.005,
          });
        },
      );

      setWatcher(sub);
      Alert.alert('Tracking', 'Now tracking your trip.');
    }

    if (state === 'tracking') {
      startWatching();
    }

    /* cleanup on pause/unmount */
    return () => {
      watcher?.remove();
      setWatcher(undefined);
    };
  }, [state]);

  /* ════════════════════════════════════════════════════════════════
   * 2)  Pause helper – shared by both buttons
   * ════════════════════════════════════════════════════════════════ */
  const handlePause = useCallback(() => {
    watcher?.remove();
    setWatcher(undefined);
    pauseTracking();          // ➜ context ➜ 'paused'
    router.push('/home');     // ➜ dashboard / tab index
  }, [watcher, pauseTracking, router]);

  /* ════════════════════════════════════════════════════════════════
   * 3)  Replace header‑left arrow with our custom action
   * ════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderBackButton onPress={handlePause} />,
      // you may disable the iOS swipe‑back gesture too:
      // gestureEnabled: false,
    });
  }, [navigation, handlePause]);

  /* ════════════════════════════════════════════════════════════════
   * 4)  Helper: decide the *very first* region – if we already have a
   *     `current` fix use that, otherwise get *last known position*
   *     synchronously (fast, may be stale) to avoid hard‑coding coords.
   * ════════════════════════════════════════════════════════════════ */
  const [initialRegion, setInitialRegion] = useState<Region | undefined>();
  useEffect(() => {
    (async () => {
      if (initialRegion) return;                // already resolved
      const lastFix = await Location.getLastKnownPositionAsync({});
      const base    = lastFix ?? current;
      if (base) {
        setInitialRegion({
          latitude      : base.coords.latitude,
          longitude     : base.coords.longitude,
          latitudeDelta : 0.01,
          longitudeDelta: 0.01,
        });
      }
    })();
  }, [current, initialRegion]);

  /* ----------------------------------------------------------------
   * 5)  RENDER
   * ---------------------------------------------------------------- */
  if (!initialRegion) {
    // quick loading spinner while we figure out where to centre the map
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        followsUserLocation
      >
        {/* dynamic trip path */}
        {points.length > 1 && (
          <Polyline
            coordinates={points.map((p) => ({
              latitude : p.coords.latitude,
              longitude: p.coords.longitude,
            }))}
            strokeColor="#2d6a4f"
            strokeWidth={5}
          />
        )}

        {/* you‑are‑here marker */}
        {current && (
          <Marker
            coordinate={{
              latitude : current.coords.latitude,
              longitude: current.coords.longitude,
            }}
            title="You"
          />
        )}
      </MapView>

      {/* red pause button */}
      <View style={styles.buttonWrap}>
        <ActionButton
          icon="pause-circle"
          label="Pause"
          background="#f94144"
          onPress={handlePause}
        />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*                                STYLES                              */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  container: { flex: 1 },
  map      : { flex: 1 },

  buttonWrap: {
    position   : 'absolute',
    bottom     : 30,
    alignSelf  : 'center',
  },

  loader: {
    flex          : 1,
    alignItems    : 'center',
    justifyContent: 'center',
  },
});
