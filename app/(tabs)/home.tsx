// app/(tabs)/home.tsx
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../components/AuthProvider';
import Colors from '../../constants/Colors';
import { useDriverSummary } from '../../hooks/useDriverSummary'; // ensure this hook exists (see notes below)

/**
 * Home (Native Dashboard Shell)
 * Shows high-level metrics & actions.
 */
export default function HomeScreen() {
  const { logout } = useAuth();
  const {
    data: summary,
    loading: summaryLoading,
    error: summaryError,
    refresh,
  } = useDriverSummary();

  const metrics = summary?.metrics;

  return (
    <View style={styles.screen}>
      {/* App Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Highway Driver App</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* Hero Section */}
        <View style={styles.heroWrap}>
          <Text style={styles.heroTitle}>Driver Home</Text>
          <Text style={styles.heroSubtitle}>
            Quick overview & actions. Expand this screen later with live stats,
            current campaign info, and trip shortcuts.
          </Text>
        </View>

        {/* Snapshot Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today’s Snapshot</Text>

            <View style={styles.metricRow}>
              <MetricBlock
                label="Miles"
                value={
                  summaryLoading
                    ? '…'
                    : summaryError
                    ? '!'
                    : metrics?.milesToday ?? 0
                }
              />
              <MetricBlock
                label="Impressions"
                value={
                  summaryLoading
                    ? '…'
                    : summaryError
                    ? '!'
                    : metrics?.impressionsToday ?? 0
                }
              />
              <MetricBlock
                label="Active Campaigns"
                value={
                  summaryLoading
                    ? '…'
                    : summaryError
                    ? '!'
                    : metrics?.assignmentsActive ?? 0
                }
              />
            </View>

          {summaryError && (
            <Text style={styles.errorMini} onPress={refresh}>
              Failed to load snapshot – tap to retry.
            </Text>
          )}

          {!summaryError && summary && (
            <Text style={styles.cardFooterNote}>
              Updated{' '}
              {new Date(summary.serverTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <IconButton
            label="Open Dashboard"
            icon={<MaterialIcons name="open-in-new" size={18} color="#fff" />}
            onPress={() => router.push('/(tabs)/driver-dashboard')}
            variant="primary"
          />
          <IconButton
            label="Logout"
            icon={<Feather name="log-out" size={18} color="#fff" />}
            onPress={async () => {
              await logout();
              router.replace('/login');
            }}
            variant="secondary"
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* ---------- Metric Block ---------- */
function MetricBlock({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.metricBlock}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

/* ---------- Reusable Icon Button ---------- */
interface IconButtonProps {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

function IconButton({ label, icon, onPress, variant = 'primary' }: IconButtonProps) {
  const bg = variant === 'primary' ? styles.primaryBtn : styles.secondaryBtn;
  return (
    <TouchableOpacity
      style={[styles.baseBtn, bg]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.btnInner}>
        {icon}
        <Text style={styles.btnText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background || '#f4fdfb',
  },
  header: {
    backgroundColor: Colors.primary || '#2d6a4f',
    paddingTop: Platform.select({ ios: 54, android: 22, default: 18 }),
    paddingBottom: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  headerTitle: {
    color: Colors.white || '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  heroWrap: { marginBottom: 20 },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary || '#2d6a4f',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: Colors.primary,
    opacity: 0.8,
  },
  card: {
    backgroundColor: Colors.card || '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: Colors.border || '#d2e8dd',
    shadowColor: Colors.shadow || '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary || '#2d6a4f',
    marginBottom: 18,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricBlock: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.highlight || '#40916c',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11.5,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: Colors.primary,
    opacity: 0.7,
    textAlign: 'center',
  },
  cardFooterNote: {
    fontSize: 11,
    color: Colors.primary,
    opacity: 0.55,
    marginTop: 10,
    textAlign: 'right',
  },
  errorMini: {
    marginTop: 8,
    fontSize: 11,
    color: '#a2261e',
    fontWeight: '600',
  },
  actions: {
    gap: 14,
    marginTop: 8,
  },
  baseBtn: {
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 22,
    shadowColor: Colors.primary || '#2d6a4f',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryBtn: {
    backgroundColor: Colors.highlight || '#40916c',
  },
  secondaryBtn: {
    backgroundColor: Colors.primary || '#2d6a4f',
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  btnText: {
    color: Colors.white || '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export { };

