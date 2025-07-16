import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useAuth } from '../components/AuthProvider';

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
      const { success, role, token = '' } = await login(username.trim(), password);

      if (!success || !token) {
        setError('Invalid credentials. Please try again.');
        return;
      }

      if (Platform.OS === 'web') {
        window.location.href = `https://highwayads.net/driver-dashboard/?token=${encodeURIComponent(token)}`;
      } else {
        router.replace({
          pathname: '/driver-dashboard',
          params: { token },
        });
      }
    } catch (e) {
      setError('An unexpected error occurred.');
      console.error('Login error', e);
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = !username.trim() || !password.trim();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#40916c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Banner/Header */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>WELCOME TO HIGHWAYADS</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Driver Login</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Username"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {/* Pill button with disabled state */}
        <Pressable
          style={({ pressed }) => [
            styles.loginButton,
            isButtonDisabled ? styles.loginButtonDisabled : null,
            pressed && !isButtonDisabled ? styles.loginButtonPressed : null,
          ]}
          onPress={handleLogin}
          disabled={isButtonDisabled}
        >
          <Text style={styles.loginButtonText}>LOGIN</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4fdfb',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  banner: {
    width: '100%',
    backgroundColor: '#26413C', // dark header (match dashboard)
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  bannerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1.2,
  },
  card: {
    width: '90%',
    maxWidth: 520,
    borderRadius: 22,
    backgroundColor: '#f8fcfa', // soft mint/white (matches dashboard card)
    padding: 32,
    alignItems: 'stretch',
    shadowColor: '#5ed2b6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.13,
    shadowRadius: 22,
    elevation: 7,
    marginTop: 30,
    marginBottom: 20,
    // Web hover effect (use in React Native Web)
    transitionProperty: 'box-shadow, transform',
    transitionDuration: '180ms',
    transitionTimingFunction: 'ease',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2d6a4f',
    textAlign: 'center',
    marginBottom: 18,
  },
  input: {
    backgroundColor: '#e7f8f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b9e4d6',
    padding: 14,
    marginBottom: 16,
    fontSize: 17,
    color: '#26413C',
  },
  loginButton: {
    backgroundColor: '#40916c',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    elevation: 1,
    shadowColor: '#40916c',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 6,
    // pill shape
    width: '100%',
    opacity: 1,
    transitionProperty: 'background, box-shadow, transform, opacity',
    transitionDuration: '140ms',
    transitionTimingFunction: 'ease',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 2,
  },
  loginButtonPressed: {
    backgroundColor: '#52b788',
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.20,
  },
  loginButtonDisabled: {
    backgroundColor: '#b9e4d6',
    opacity: 0.7,
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
});

