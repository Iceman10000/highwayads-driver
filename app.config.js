// app.config.js
import 'dotenv/config'; // Loads .env and EAS env variables

/** @type {import('@expo/config').ExpoConfig} */
export default ({ config }) => ({
  // ---- keep everything from your original app.json ----
  ...config,

  android: {
    ...config.android,

    // Add the Maps key to the Android manifest
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_ANDROID_APIKEY,
      },
    },
  },
});
