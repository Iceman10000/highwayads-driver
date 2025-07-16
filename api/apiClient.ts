import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Your WordPress REST API base URL
const API_BASE = 'https://highwayads.net/wp-json';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Automatically attach JWT to every request (if present)
api.interceptors.request.use(
  async config => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.log('Error reading token:', e);
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
