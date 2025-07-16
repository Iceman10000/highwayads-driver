import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import api from '../api/apiClient';




interface AuthContextType {
  token: string | null;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; role?: string; token?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token on mount
  useEffect(() => {
    AsyncStorage.getItem('jwtToken')
      .then(stored => {
        if (stored) setToken(stored);
      })
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; role?: string; token?: string }> => {
    try {
      const { data } = await api.post('/jwt-auth/v1/token', { username, password });
      if (data.token) {
        setToken(data.token);
        await AsyncStorage.setItem('jwtToken', data.token);

        // Default role to 'driver' (customize this if you do role fetching)
        const role = 'driver';
        return { success: true, role, token: data.token };
      }
    } catch (err: any) {
      console.log('Login error:', err?.response?.data || err.message);
    }
    return { success: false };
  };

  const logout = () => {
    setToken(null);
    AsyncStorage.removeItem('jwtToken');
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
