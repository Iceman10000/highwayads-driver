// app/index.tsx
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../components/AuthProvider';
import Colors from '../constants/Colors';

export default function Index() {
  const { token, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (token) router.replace('/home');
    else router.replace('/login');
  }, [loading, token]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
      <ActivityIndicator size="large" color={Colors.highlight} />
    </View>
  );
}
