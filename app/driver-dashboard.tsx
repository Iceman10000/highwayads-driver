import { useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '../components/AuthProvider';
import Colors from '../constants/Colors';

const DRIVER_DASHBOARD_BASE_URL = 'https://highwayads.net/driver-dashboard/';

export default function DriverDashboardScreen() {
  const { token, logout } = useAuth();
  const params = useLocalSearchParams();
  const incomingToken =
    typeof params.token === 'string' ? params.token : undefined;

  // If no JWT anywhere, force back to login
  useEffect(() => {
    if (!token && !incomingToken) {
      logout();
      if (Platform.OS === 'web') {
        window.location.href = '/login';
      }
    }
  }, [token, incomingToken]);

  // Build URL (prefer the incoming param on first load)
  const finalUrl = incomingToken
    ? `${DRIVER_DASHBOARD_BASE_URL}?token=${encodeURIComponent(
        incomingToken
      )}`
    : `${DRIVER_DASHBOARD_BASE_URL}?token=${encodeURIComponent(token!)}`;

  // On web we hard-redirect so cookies get set
  if (Platform.OS === 'web') {
    window.location.href = finalUrl;
    return null;
  }

  // Native: show WebView
  return (
    <View style={styles.container}>
      {!token && !incomingToken ? (
        <ActivityIndicator size="large" color={Colors.highlight} />
      ) : (
        <WebView
          source={{ uri: finalUrl }}
          startInLoadingState={true}
          renderLoading={() => (
            <ActivityIndicator
              style={{ flex: 1 }}
              size="large"
              color={Colors.highlight}
            />
          )}
          onShouldStartLoadWithRequest={(event) =>
            // external links open externally
            !event.url.startsWith(DRIVER_DASHBOARD_BASE_URL) &&
            !event.url.startsWith('https://highwayads.net/')
              ? false
              : true
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
