// api/driverService.ts
import api from './apiClient';

// Exposes a single method to get the current user's profile
export default {
  getProfile: async () => {
    // WP-JWT plugin typically exposes `/wp/v2/users/me`
    const { data } = await api.get('/wp/v2/users/me');
    return data;
  },
};
