// app/(tabs)/driver-dashboard.tsx
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '../../components/AuthProvider';
import Colors from '../../constants/Colors';

const DASHBOARD_URL_BASE = 'https://highwayads.net/driver-dashboard/';

export default function DriverDashboardScreen() {
  const { token, logout } = useAuth();
  const params = useLocalSearchParams();

  const paramToken =
    Platform.OS === 'web' && typeof params.token === 'string'
      ? params.token
      : undefined;

  const effectiveToken = useMemo(
    () => (Platform.OS === 'web' ? paramToken || token : token),
    [paramToken, token]
  );

  useEffect(() => {
    if (!effectiveToken) {
      router.replace('/login');
    }
  }, [effectiveToken]);

  if (!effectiveToken) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.highlight} />
      </View>
    );
  }

  const query = `?token=${encodeURIComponent(effectiveToken)}&appEmbed=1`;
  const finalUrl = `${DASHBOARD_URL_BASE}${query}`;

  if (Platform.OS === 'web') {
    return (
      <div style={webStyles.wrapper}>
        <iframe
          title="Driver Dashboard"
          src={finalUrl}
          style={webStyles.iframe}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        key={effectiveToken}
        incognito
        source={{ uri: finalUrl }}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator
            style={{ flex: 1 }}
            size="large"
            color={Colors.highlight}
          />
        )}
        onShouldStartLoadWithRequest={(event) => {
          const { url } = event;
            if (url.includes('wp-login.php') && url.includes('loggedout')) {
            logout();
            router.replace('/login');
            return false;
          }
          return (
            url.startsWith(DASHBOARD_URL_BASE) ||
            url.startsWith('https://highwayads.net/')
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});

const webStyles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flex: 1,
    width: '100%',
    height: '100%',
  },
  iframe: {
    border: 'none',
    width: '100%',
    height: '100vh',
    background: Colors.background || '#f4fdfb',
  },
};
