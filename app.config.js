// app.config.js
import 'dotenv/config'; // Loads .env and EAS env variables

/** @type {import('@expo/config').ExpoConfig} */
export default ({ config }) => {
  // Build plugin list and add edge-to-edge only if not present
  const existing = (config.plugins ?? []).map(p => (Array.isArray(p) ? p[0] : p));
  const plugins = [...(config.plugins ?? [])];
  if (!existing.includes('react-native-edge-to-edge')) {
    plugins.push([
      'react-native-edge-to-edge',
      {
        android: {
          parentTheme: 'Default',
          enforceNavigationBarContrast: false
        }
      }
    ]);
  }

  // Bump versionCode safely (Play needs a higher code each upload)
  const nextVersionCode =
    typeof config.android?.versionCode === 'number'
      ? config.android.versionCode + 1
      : 1;

  return {
    // keep everything from your base config (including app.json)
    ...config,

    android: {
      ...config.android,
      versionCode: nextVersionCode,
      edgeToEdgeEnabled: true,
      // keep existing android.config and add Google Maps key
      config: {
        ...(config.android?.config ?? {}),
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_ANDROID_APIKEY
        }
      }
    },

    plugins
  };
};
