import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome,
  MaterialIcons,
} from '@expo/vector-icons';
import { format } from 'date-fns';
import { router, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../components/AuthProvider';
import { useTracking } from '../../components/TrackingContext';
import Colors from '../../constants/Colors';


/* ---- Constants ---- */
const MAX_WIDTH = 860;
const bannerGreen = '#0f3e46';
const primaryDark = '#124634';
const cardBg = '#fff';
const cardShadow = Colors.shadow || '#14342B';
const actionGreen = '#2f7d55';
const actionGreenD = '#1f5b43';

export default function HomeScreen() {
  const { logout, token } = useAuth();
const { state, startTracking, resumeTracking } = useTracking();


  // Driver info
  const [driverName, setDriverName] = useState('Driver');
  const [driverEmail, setDriverEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [lifetimeImpressions, setLifetimeImpressions] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [assignments, setAssignments] = useState([]);

  // Dashboard metrics
  const [miles, setMiles] = useState(0);
  const [impressions, setImpressions] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // ---- Fetch driver + dashboard data ----
  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      setRefreshing(true);
      const res = await fetch(
        'https://highwayads.net/wp-json/highwayads/v1/driver-assignments',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      setDriverName(json.driver_name ?? 'Driver');
      setDriverEmail(json.driver_email ?? '');
      setProfilePhoto(json.profile_photo ?? '');
      setLifetimeImpressions(json.lifetime_impressions ?? 0);
      setPendingPayments(json.pending_payments ?? 0);
      setAssignmentCount(json.assignments?.length ?? 0);
      setAssignments(Array.isArray(json.assignments) ? json.assignments : []);
      setMiles(json.total_miles ?? 0);
      setImpressions(json.impressions ?? 0);
      setEarnings(0);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[Home] fetchStats error:', err);
      setLastUpdated(new Date());
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 1000 * 60 * 1); // 1-min refresh
    return () => clearInterval(id);
  }, [fetchStats]);

  // ---- Actions ----
  const handleOpenDashboard = () => {
    if (Platform.OS === 'web') {
      const base = 'https://highwayads.net/driver-dashboard/';
      window.open(
        `${base}?driver_jwt=${encodeURIComponent(token || '')}`,
        '_blank',
        'noopener'
      );
    } else {
      router.push('/driver-dashboard');
    }
  };
  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>WELCOME TO HIGHWAYADS APP</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchStats}
            colors={[Colors.accent]}
            tintColor={Colors.accent}
          />
        }
      >
        <View style={styles.centerWrap}>
          {/* Single Modern Card */}
          <View style={styles.mainCard}>
            {/* Profile Row */}
            <View style={styles.profileRow}>
              <View style={styles.avatarCircle}>
                {profilePhoto ? (
                  <Image
                    source={{ uri: profilePhoto }}
                    style={styles.avatarImg}
                    resizeMode="cover"
                  />
                ) : (
                  <FontAwesome name="user-circle" size={54} color={primaryDark} />
                )}
              </View>
              <View style={styles.profileDetails}>
                <Text style={styles.profileName}>Welcome, {driverName}!</Text>
                {!!driverEmail && (
                  <Text style={styles.profileEmail}>{driverEmail}</Text>
                )}
              </View>
            </View>
            {/* Stats Row */}
            <View style={styles.statsGrid}>
              <StatBlock
                icon={
                  <MaterialIcons name="assignment-turned-in" size={19} color={actionGreen} />
                }
                label="Assignments"
                value={assignmentCount}
              />
              <StatBlock
                icon={<AntDesign name="star" size={18} color="#d4af37" />}
                label="Lifetime Impressions"
                value={lifetimeImpressions}
              />
              <StatBlock
                icon={<MaterialIcons name="payment" size={19} color="#d12c2c" />}
                label="Pending Payments"
                value={pendingPayments}
              />
            </View>
            {/* Assignment List */}
            {assignments.length > 0 && (
              <View style={styles.assignmentList}>
                {assignments.map((a: any) => (
                  <TouchableOpacity
                    key={a.id}
                    onPress={() => openURL(a.link)}
                    style={styles.assignmentItem}
                  >
                    <Feather name="map-pin" size={15} color={actionGreenD} />
                    <Text style={styles.assignmentTitle}>{a.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {/* Divider */}
            <View style={styles.cardDivider} />
            {/* Dashboard Metrics */}
            <View style={styles.metricsRow}>
              <MetricBlock label="MILES" value={miles} />
              <MetricBlock label="IMPRESSIONS" value={impressions} />
              <MetricBlock label="EARNINGS" value={`$${earnings}`} />
            </View>
            {/* Timestamp */}
            {lastUpdated && (
              <View style={styles.timestampRow}>
                <Text style={styles.updatedText}>
                  Updated {format(lastUpdated, 'hh:mm a')}
                </Text>
              </View>
            )}
           <View style={styles.actionsWrap}>
          <TripToggleButton />
          <ActionButton
            icon="open-in-new"
            label="Open Dashboard"
            onPress={handleOpenDashboard}
            background={actionGreen}
          />
          <ActionButton
            icon="logout"
            label="Logout"
            onPress={handleLogout}
            background={actionGreenD}
          />
        </View>
          </View>
          {/* Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerCopy}>
              © {new Date().getFullYear()} Highway Ads. All rights reserved.
            </Text>
            <View style={styles.socialRow}>
              <SocialIcon
                aria="Facebook"
                onPress={() => openURL('https://facebook.com')}
              >
                <FontAwesome name="facebook" size={20} color="#1877F2" />
              </SocialIcon>
              <SocialIcon
                aria="Instagram"
                onPress={() => openURL('https://instagram.com')}
              >
                <AntDesign name="instagram" size={20} color="#E4405F" />
              </SocialIcon>
              <SocialIcon
                aria="X / Twitter"
                onPress={() => openURL('https://twitter.com')}
              >
                <Feather name="twitter" size={20} color="#1DA1F2" />
              </SocialIcon>
              <SocialIcon
                aria="LinkedIn"
                onPress={() => openURL('https://linkedin.com')}
              >
                <Entypo name="linkedin" size={20} color="#0077B5" />
              </SocialIcon>
              <SocialIcon
                aria="Call"
                onPress={() => openURL('tel:+16827199102')}
              >
                <Feather name="phone-call" size={20} color={primaryDark} />
              </SocialIcon>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function TripToggleButton() {
  const { state, startTracking, pauseTracking, resumeTracking } = useTracking();
  const router = useRouter();

  const handlePress = () => {
    if (state === 'idle') {
      startTracking();
      router.push('/trip-tracker');
    } else if (state === 'tracking') {
      pauseTracking();
      router.replace('/home'); // or router.push if you prefer
    } else if (state === 'paused') {
      resumeTracking();
      ToastAndroid.show('Now Tracking', ToastAndroid.SHORT);
      router.push('/trip-tracker');
    }
  };

  const getLabel = () => {
    if (state === 'idle') return 'Start';
    if (state === 'tracking') return 'Pause';
    if (state === 'paused') return 'Resume';
    return 'Start';
  };

  return (
    <ActionButton
      icon="navigation"
      label={getLabel()}
      onPress={handlePress}
      background="#40916c"
    />
  );
}


/* --- Components --- */
function StatBlock({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) {
  return (
    <View style={styles.statBlock}>
      <View style={{ marginBottom: 2 }}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}
function MetricBlock({ label, value }: { label: string; value: any }) {
  return (
    <View style={styles.metricBlock}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}
function openURL(url: string) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener');
  } else {
    Linking.openURL(url);
  }
}
function ActionButton({
  icon,
  label,
  onPress,
  background,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  background: string;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.actionBtn, { backgroundColor: background }]}
    >
      <MaterialIcons
        name={icon}
        color="#fff"
        size={18}
        style={{ marginRight: 8 }}
      />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}
function SocialIcon({
  children,
  onPress,
  aria,
}: {
  children: React.ReactNode;
  onPress: () => void;
  aria: string;
}) {
  return (
    <TouchableOpacity
      accessibilityLabel={aria}
      accessibilityRole="link"
      onPress={onPress}
      activeOpacity={0.65}
      style={styles.iconWrap}
      hitSlop={10}
    >
      {children}
    </TouchableOpacity>
  );
}

/* --- Styles --- */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  banner: {
    backgroundColor: bannerGreen,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },
  bannerText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
    fontSize: 14,
  },
  scrollContent: {
    paddingTop: 26,
    paddingBottom: 140,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  centerWrap: { width: '100%', maxWidth: MAX_WIDTH },

  // --- Modern Unified Card ---
   mainCard: {
    backgroundColor: '#9ff0dbff', // soft mint, not white
    borderRadius: 28,
    paddingVertical: 30,
    paddingHorizontal: 40,
    marginBottom: 36,
    shadowColor: cardShadow,
    shadowOpacity: 0.11,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
    maxWidth: 510,
    alignSelf: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 62, height: 62, borderRadius: 31,
    backgroundColor: '#e8f2ed',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  avatarImg: { width: 62, height: 62, borderRadius: 31 },
  profileDetails: { marginLeft: 16, flex: 1 },
  profileName: {
    fontSize: 22, fontWeight: '700', color: primaryDark, marginBottom: 2,
  },
  profileEmail: {
    fontSize: 15, color: '#333', opacity: 0.8, marginBottom: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 3,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#ddf0ecff',
    marginHorizontal: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: primaryDark,
    marginTop: 1,
  },
  statLabel: {
    fontSize: 12.2,
    fontWeight: '600',
    color: primaryDark,
    opacity: 0.8,
    marginTop: 2,
    textAlign: 'center',
  },
  assignmentList: {
    marginTop: 7,
    marginBottom: 3,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 5,
    gap: 2,
  },
  assignmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 6,
  },
  assignmentTitle: {
    fontSize: 14,
    color: primaryDark,
    marginLeft: 5,
    textDecorationLine: 'underline',
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 17,
    opacity: 0.5,
  },

  // --- Dashboard metrics ---
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 26,
    gap: 6,
  },
  metricBlock: { flex: 1, alignItems: 'center' },
  metricValue: {
    fontSize: 26,
    fontWeight: '700',
    color: primaryDark,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: primaryDark,
    opacity: 0.7,
    letterSpacing: 0.5,
  },
  timestampRow: {
    position: 'relative',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  updatedText: {
    fontSize: 11,
    color: primaryDark,
    opacity: 0.55,
    textAlign: 'right',
  },
  actionsWrap: { width: '100%', alignItems: 'center' },
  actionBtn: {
    width: '100%',
    maxWidth: 350,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 26,
    marginBottom: 13,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  actionLabel: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.4,
    fontSize: 14.5,
  },
  // --- Footer ---
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 42,
    alignItems: 'center',
    flexWrap: 'wrap',
    rowGap: 16,
  },
  footerCopy: { fontSize: 12, color: primaryDark, opacity: 0.7 },
  socialRow: { flexDirection: 'row', alignItems: 'center', columnGap: 24 },
  iconWrap: { padding: 4, borderRadius: 6 },
});
