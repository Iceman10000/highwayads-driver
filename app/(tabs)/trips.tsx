// app/(tabs)/trips.tsx
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Colors from '../../constants/Colors';
import { useDriverTrips } from '../../hooks/useDriverTrips';

export default function TripsScreen() {
  const { trips, loading, error, refreshing, refresh } = useDriverTrips();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trips</Text>
      </View>
      {loading && !trips.length ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.highlight} />
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => (item.id ? String(item.id) : item.route + item.trip_date)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={Colors.highlight}
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No trips yet.</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.tripCard}>
              <Text style={styles.route}>{item.route || '—'}</Text>
              <Text style={styles.metaLine}>
                Miles: <Text style={styles.metaValue}>{item.miles ?? 0}</Text> |{' '}
                Earnings: <Text style={styles.metaValue}>${item.earnings ?? 0}</Text>
              </Text>
              <Text style={styles.metaSub}>
                {item.trip_date || 'Unknown date'} / Status: {item.status || 'Active'}
              </Text>
            </View>
          )}
        />
      )}
      {error && (
        <View style={styles.errorBar}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 18,
    paddingBottom: 10,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 60 },
  tripCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  route: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 6,
  },
  metaLine: {
    fontSize: 13,
    color: Colors.primary,
    marginBottom: 4,
  },
  metaValue: {
    fontWeight: '700',
    color: Colors.highlight,
  },
  metaSub: {
    fontSize: 11.5,
    color: Colors.primary,
    opacity: 0.7,
  },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: Colors.primary, opacity: 0.6 },
  errorBar: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    backgroundColor: '#ffe5e2',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#f2b4ac',
  },
  errorText: {
    textAlign: 'center',
    color: '#b03021',
    fontWeight: '600',
  },
});
