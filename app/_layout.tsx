// app/_layout.tsx
import { Slot } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../components/AuthProvider';
import IdleWarningOverlay from '../components/IdleWarningOverlay';

export default function RootLayout() {
  return (
    <AuthProvider>
      <IdleWarningOverlay />
      <Slot />
    </AuthProvider>
  );
}
