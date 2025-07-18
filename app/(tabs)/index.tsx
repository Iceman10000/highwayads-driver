import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import api from '../../api/apiClient';
import { useAuth } from '../../components/AuthProvider';
import Colors from '../../constants/Colors'; // Adjust path if needed!

export default function DashboardScreen() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.replace('/login');
      return;
    }
    api.get('/wp/v2/users/me')
      .then(res => setProfile(res.data))
      .catch(err => {
        logout();
        router.replace('/login');
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.highlight} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>You are not currently logged in.</Text>
        <Button title="Back to Login" color={Colors.primary} onPress={() => router.replace('/login')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome, {profile.name || 'Driver'}!</Text>
        <Button
          title="Logout"
          color={Colors.accent}
          onPress={() => { logout(); router.replace('/login'); }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 32,
    color: Colors.primary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.primary,
  },
  errorText: {
    fontSize: 18,
    color: Colors.accent,
    marginBottom: 20,
  },
});
