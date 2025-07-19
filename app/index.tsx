import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../components/AuthProvider';

export default function Gate() {
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      router.replace('/(tabs)/home');          // or '/(tabs)/driver-dashboard' if you want to land directly there
    } else {
      router.replace('/login');
    }
  }, [token]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
