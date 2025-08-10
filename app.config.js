// app.config.js
import 'dotenv/config'; // Loads .env and EAS env variables

/** @type {import('@expo/config').ExpoConfig} */
export default ({ config }) => {
  // Ensure we always beat the highest code already on Play
  const MIN_VERSION_CODE = 22; // > 21 (your last release)
  const base =
    typeof config.android?.versionCode === 'number' ? config.android.versionCode : 0;
  const nextVersionCode = Math.max(MIN_VERSION_CODE, base + 1);

  // Add edge-to-edge plugin if missing
  const existing = (config.plugins ?? []).map(p => (Array.isArray(p) ? p[0] : p));
  const plugins = [...(config.plugins ?? [])];
  if (!existing.includes('react-native-edge-to-edge')) {
    plugins.push([
      'react-native-edge-to-edge',
      { android: { parentTheme: 'Default', enforceNavigationBarContrast: false } }
    ]);
  }

  return {
    ...config,
    android: {
      ...config.android,
      versionCode: nextVersionCode,
      edgeToEdgeEnabled: true,
      config: {
        ...(config.android?.config ?? {}),
        googleMaps: { apiKey: process.env.GOOGLE_MAPS_ANDROID_APIKEY }
      }
    },
    plugins
  };
};
