import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import ActionButton from '../../components/ActionButton';
import { useTracking } from '../../components/TrackingContext';



export default function TripTracker() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const { state, pauseTracking } = useTracking();
  const [location, setLocation] = React.useState<Location.LocationObject | null>(null);

  // Show "Now Tracking" message if coming from Resume
  useEffect(() => {
    if (state === 'tracking') {
      Alert.alert('Tracking', 'Now Tracking');
    }
  }, [state]);

  // Watch location while tracking
  useEffect(() => {
    let subscription: Location.LocationSubscription;

    const startWatching = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (loc) => {
          setLocation(loc);
          console.log('Tracking location:', loc.coords);
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            });
          }
        }
      );
    };

    if (state === 'tracking') {
      startWatching();
    }

    return () => {
      if (subscription) subscription.remove();
    };
  }, [state]);

  const handlePause = () => {
    pauseTracking();
    router.push('/home'); // Goes back to Home screen
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        followsUserLocation
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="You are here"
          />
        )}
      </MapView>

      <View style={styles.buttonWrap}>
        <ActionButton
          icon="pause-circle"
          label="Pause"
          onPress={handlePause}
          background="#f94144"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  buttonWrap: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
});
