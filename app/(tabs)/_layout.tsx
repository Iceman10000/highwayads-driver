/**
 * app/(tabs)/_layout.tsx
 * Nested under the root‑stack.  Default is *no header* for tab
 * screens – except we turn it ON for the trip‑tracker screen so the
 * user sees a nice title bar while driving.
 */
import { Stack } from 'expo-router';

export default function TabsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,      // default for every tab‑screen
      }}
    >
      {/* Trip‑tracker gets its own header bar */}
      <Stack.Screen
        name="trip-tracker"      // matches file name: app/(tabs)/trip-tracker.tsx
        options={{
          headerShown: true,
          title: 'Trip Tracker',
        }}
      />
    </Stack>
  );
}
