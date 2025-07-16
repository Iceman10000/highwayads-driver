import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
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
  const cardAnim = useRef(new Animated.Value(1)).current;

  // Safe "hover" only for web
  const handleHoverIn = () => {
    if (Platform.OS === 'web') {
      Animated.spring(cardAnim, {
        toValue: 1.03,
        useNativeDriver: true,
      }).start();
    }
  };
  const handleHoverOut = () => {
    if (Platform.OS === 'web') {
      Animated.spring(cardAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const { success, token = '' } = await login(username.trim(), password);
      if (!success || !token) {
        setError('Invalid credentials. Please try again.');
        return;
      }
      if (Platform.OS === 'web') {
        window.location.href = `https://highwayads.net/driver-dashboard/?token=${encodeURIComponent(token)}`;
      } else {
        router.replace({ pathname: '/driver-dashboard', params: { token } });
      }
    } catch (e) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>WELCOME TO HIGHWAYADS</Text>
      </View>

      {/* Centered login card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <Pressable
          onHoverIn={handleHoverIn}
          onHoverOut={handleHoverOut}
          style={{ width: '100%', alignItems: 'center' }}
        >
          <Animated.View style={[styles.card, { transform: [{ scale: cardAnim }] }]}>
            <Text style={styles.title}>Driver Login</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
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
            <Pressable
              style={[
                styles.loginButton,
                !(username && password) && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={!(username && password) || loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.loginButtonText}>LOGIN</Text>
              )}
            </Pressable>
          </Animated.View>
        </Pressable>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  banner: {
    backgroundColor: Colors.primary,
    paddingTop: 10,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 42,
    elevation: 3,
    zIndex: 2,
  },
  bannerText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "#e8faf4",
    fontSize: 17,
    marginBottom: 14,
    color: Colors.primary,
  },
  loginButton: {
    width: "100%",
    paddingVertical: 16,
    backgroundColor: Colors.highlight,
    borderRadius: 999,
    alignItems: "center",
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
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 1,
  },
  error: {
    color: "#a2261e",
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "bold",
  },
});
