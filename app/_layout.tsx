// app/_layout.tsx
import { Slot } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../components/AuthProvider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}

