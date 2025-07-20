/* -------------------------------------------------------------------------
   Home – Driver quick‑actions screen
   -------------------------------------------------------------------------
   • Expo Router tab: /home
   • Works on native + web
   • Pop‑out focus card on hover (web only)
   • “Open Dashboard” opens WP dashboard (web) or pushes /driver‑dashboard
   ---------------------------------------------------------------------- */

import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome,
  MaterialIcons,
} from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../components/AuthProvider';
import Colors from '../../constants/Colors';

/* ───────── constants ───────── */
const MAX_WIDTH = 860;
const BUTTON_MAX_WIDTH = 740;
const SHOW_HOME_PILL_WHEN_ACTIVE = false;

/* brand palette for this page */
const bannerGreen   = '#0f3e46';
const primaryDark   = '#124634';
const cardBg        = '#e8f2ed99';   // translucent mint
const actionGreen   = '#2f7d55';
const actionGreenD  = '#1f5b43';

/* ---------------------------------------------------------------------- */
export default function HomeScreen() {
  const { logout, token } = useAuth();
  const pathname         = usePathname();

  /* re‑render each minute so the timestamp stays fresh */
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  /* fake metrics (hook your API later) */
  const metrics = useMemo(
    () => [
      { label: 'MILES',            value: 0 },
      { label: 'IMPRESSIONS',      value: 0 },
      { label: 'ACTIVE CAMPAIGNS', value: 0 },
    ],
    []
  );

  const updatedTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: "2-digit",
  });

  /* ---------------- actions ---------------- */
  const handleOpenDashboard = () => {
    if (Platform.OS === 'web') {
      const base = 'https://highwayads.net/driver-dashboard/';
      window.open(
        `${base}?driver_jwt=${encodeURIComponent(token || '')}`,
        '_blank',
        'noopener',
      );
    } else {
      router.push('/driver-dashboard');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  /* ------------- hover state (web only) ------------- */
  const [hover, setHover] = useState(false);

  /* floating pill visible only off‑home unless override */
  const showHomePill =
    SHOW_HOME_PILL_WHEN_ACTIVE ||
    (pathname !== '/home' && pathname !== '/(tabs)/home');

  /* ------------------------------------------------------------------ */
  return (
    <View style={styles.screen}>
      {/* banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>WELCOME TO HIGHWAYADS APP</Text>
      </View>

      {/* main scroll */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.centerWrap}>
          <Text style={styles.title}>Home</Text>
          <Text style={styles.subtitle}>
            Quick overview &amp; actions. Expand this screen later with live
            stats, current campaign info, and trip shortcuts.
          </Text>

          {/* focus card */}
          <View
            {...(Platform.OS === 'web' && {
              onMouseEnter: () => setHover(true),
              onMouseLeave: () => setHover(false),
            })}
            style={[
              styles.focusGroup,
              hover && Platform.OS === 'web' && styles.focusGroupHover,
            ]}
          >
            {/* metrics */}
            <View style={styles.metricsRow}>
              {metrics.map((m, i) => (
                <View key={i} style={styles.metricBlock}>
                  <Text style={styles.metricValue}>{m.value}</Text>
                  <Text style={styles.metricLabel}>{m.label}</Text>
                </View>
              ))}
            </View>

            {/* timestamp */}
            <View style={styles.timestampRow}>
              <Text style={styles.updatedText}>Updated {updatedTime}</Text>
            </View>

            {/* buttons */}
            <View style={styles.actionsWrap}>
              <ActionButton
                icon="open-in-new"
                label="Open Dashboard"
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

          {/* footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerCopy}>
              © {new Date().getFullYear()} Highway Ads. All rights reserved.
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

      {/* floating “Home” pill */}
      {showHomePill && (
        <View style={styles.fabBar} pointerEvents="box-none">
          <View style={styles.fabContainer}>
            <TouchableOpacity
              style={styles.fab}
              activeOpacity={0.85}
              onPress={() => router.replace('/(tabs)/home')}
            >
              <MaterialIcons name="home" size={20} color="#fff" />
              <Text style={styles.fabText}>Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* helpers                                                            */
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

/* ------------------------------------------------------------------ */
/* stylesheet                                                         */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },

  /* banner */
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

  /* layout */
  scrollContent: {
    paddingTop: 26,
    paddingBottom: 140,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  centerWrap: { width: '100%', maxWidth: MAX_WIDTH },

  /* headings */
  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    color: primaryDark,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: primaryDark,
    opacity: 0.78,
    fontSize: 13.5,
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 24,
  },

  /* focus card */
  focusGroup: {
    width: '100%',
    backgroundColor: cardBg,
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    transitionDuration: '150ms',
    ...Platform.select({
      web: { backdropFilter: 'blur(5px)' } as any,
    }),
  },
  focusGroupHover:
    Platform.OS === 'web'
      ? ({
          transform: 'translateY(-6px)',
          boxShadow: '0 14px 34px rgba(0,0,0,0.12)',
        } as any)
      : {},

  /* metrics */
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 28,
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

  /* timestamp */
  timestampRow: {
    position: 'relative',
    marginBottom: 24,
  },
  updatedText: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    fontSize: 11,
    color: primaryDark,
    opacity: 0.55,
  },

  /* actions */
  actionsWrap: { width: '100%', alignItems: 'center' },
  actionBtn: {
    width: '100%',
    maxWidth: BUTTON_MAX_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 26,
    marginBottom: 18,
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

  /* footer */
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 42,
    alignItems: 'center',
    flexWrap: 'wrap',
    rowGap: 16,
  },
  footerCopy: { fontSize: 12, color: primaryDark, opacity: 0.7 },
  socialRow:  { flexDirection: 'row', alignItems: 'center', columnGap: 24 },
  iconWrap:   { padding: 4, borderRadius: 6 },

  /* floating pill */
  fabBar: { position: 'absolute', bottom: 16, left: 0, right: 0, alignItems: 'center' },
  fabContainer: { backgroundColor: 'transparent' },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: primaryDark,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 40,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  fabText: { color: '#fff', fontWeight: '600', marginLeft: 8, fontSize: 14 },
});
