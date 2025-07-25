import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, StyleSheet, View } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import Colors from '../constants/Colors';

export default function TripTracker() {
  const mapRef = useRef<MapView>(null);
  const [locations, setLocations] = useState<Location.LocationObject[]>([]);
  const [watcher, setWatcher] = useState<Location.LocationSubscription | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required to track your trip.');
      }
    })();
  }, []);

  const startTracking = async () => {
    const current = await Location.getCurrentPositionAsync({});
    setLocations([current]);

    const sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000,
        distanceInterval: 5,
      },
      (loc) => {
        setLocations((prev) => [...prev, loc]);
        mapRef.current?.animateToRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    );

    setWatcher(sub);
    setIsTracking(true);
  };

  const stopTracking = () => {
    watcher?.remove();
    setWatcher(null);
    setIsTracking(false);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        initialRegion={{
          latitude: locations[0]?.coords.latitude || 37.78825,
          longitude: locations[0]?.coords.longitude || -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {locations.length > 0 && (
          <Polyline
            coordinates={locations.map((loc) => ({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            }))}
            strokeColor={Colors.primary || 'blue'}
            strokeWidth={4}
          />
        )}
      </MapView>

      <View style={styles.buttonContainer}>
        <Button
          title={isTracking ? 'Stop Tracking' : 'Start Tracking'}
          color={Colors.highlight || '#007bff'}
          onPress={isTracking ? stopTracking : startTracking}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
