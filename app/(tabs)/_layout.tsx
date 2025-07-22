// app/(tabs)/_layout.tsx
import { Slot } from 'expo-router';

// This layout renders just your page content. No extra tab bar/buttons.
export default function Layout() {
  return <Slot />;
}
