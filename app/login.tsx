import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../components/AuthProvider';
import Colors from '../constants/Colors';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      console.log('Attempting login with:', username, password);
      const { success, token } = await login(username.trim(), password);
      console.log('Login result:', { success, token });

      if (!success || !token) {
        setError('Invalid credentials. Please try again.');
        return;
      }

      if (Platform.OS === 'web') {
        // Hard-redirect on web so the JWT ends up in a cookie
        window.location.href = `https://highwayads.net/driver-dashboard/?token=${encodeURIComponent(
          token
        )}`;
      } else {
        // In-app navigate on native
        router.replace({
          pathname: '/driver-dashboard',
          params: { token },
        });
      }
    } catch (e) {
      console.error('Login error', e);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Driver Login</Text>
      </View>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor={Colors.primary + '99'}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor={Colors.primary + '99'}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <Button
          title={loading ? 'Logging in…' : 'Login'}
          onPress={handleLogin}
          disabled={loading || !username || !password}
          color={Colors.highlight}
        />
        {loading && (
          <ActivityIndicator
            style={{ marginTop: 16 }}
            size="large"
            color={Colors.highlight}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  banner: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  bannerText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1.2,
  },
  card: {
    width: '90%',
    marginTop: 40,
    padding: 24,
    backgroundColor: Colors.card,
    borderRadius: 22,
    alignItems: 'stretch',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.13,
    shadowRadius: 22,
    elevation: 7,
  },
  input: {
    backgroundColor: '#e8faf4',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 22,
    fontSize: 17,
    marginBottom: 16,
    color: Colors.primary,
  },
  error: {
    color: '#a2261e',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
