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
   // Only web needs the query param to set the cookie
   window.location.href =
     `https://highwayads.net/driver-dashboard/?token=${encodeURIComponent(token)}`;
 } else {
   // Native: no param, we’ll use context token
   router.replace('/driver-dashboard');
 }
      }
    catch (e) {
      console.error('Login error', e);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

return (
  <View style={styles.root}>
    {/* 1. Persistent top banner */}
    <View style={styles.topBanner}>
      <Text style={styles.topBannerText}>
        WELCOME TO HIGHWAYADS
      </Text>
    </View>

    {/* 2. Subtitle under the banner */}
    <Text style={styles.subtitle}>
      Driver App
    </Text>

    {/* 3. Your existing login card */}
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Driver Login</Text>

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
  </View>
);


}
const styles = StyleSheet.create({
  // ────────────────────────────────────────────────────────────────
  // 1. Full‐screen root
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ────────────────────────────────────────────────────────────────
  // 2. Top banner
  topBanner: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  topBannerText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },

  // ────────────────────────────────────────────────────────────────
  // 3. Subtitle under banner
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },

  // ────────────────────────────────────────────────────────────────
  // 4. Card wrapper for login form
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 28,
    padding: 30,
    minWidth: 340,
    width: 400,
    maxWidth: '96%',
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 7 },
    elevation: 7,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },

  // ────────────────────────────────────────────────────────────────
  // 5. Text inputs
  input: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#e8faf4',
    fontSize: 17,
    marginBottom: 14,
    color: Colors.primary,
  },

  // ────────────────────────────────────────────────────────────────
  // 6. Button styles
  loginButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: Colors.highlight,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: Colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: Colors.disabled,
    shadowOpacity: 0.02,
  },
  loginButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },

  // ────────────────────────────────────────────────────────────────
  // 7. Error text
  error: {
    color: '#a2261e',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

