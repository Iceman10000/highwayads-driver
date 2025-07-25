// app/_layout.tsx
import { Slot } from 'expo-router';
import { AuthProvider } from '../components/AuthProvider';
import IdleWarningOverlay from '../components/IdleWarningOverlay';
import { TrackingProvider } from '../components/TrackingContext'; // adjust if needed

export default function RootLayout() {
  return (
    <AuthProvider>
      <TrackingProvider>
        <IdleWarningOverlay />
        <Slot />
      </TrackingProvider>
    </AuthProvider>
  );
}

