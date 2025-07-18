import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import api from '../../api/apiClient';
import { useAuth } from '../../components/AuthProvider';


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
    // Load profile from backend using the token
    api.get('/wp/v2/users/me')
      .then(res => setProfile(res.data))
      .catch(err => {
        // If API fails, log out and redirect
        logout();
        router.replace('/login');
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Text>Loading...</Text>;
  if (!profile) return <Text>You are not currently logged in.</Text>;

  return (
    <View>
      <Text>Welcome, {profile.name || 'Driver'}!</Text>
      <Button title="Logout" onPress={() => { logout(); router.replace('/login'); }} />
    </View>
  );
}
