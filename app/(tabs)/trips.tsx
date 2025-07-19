// app/(tabs)/trips.tsx (example screen)
import { queueItemToTrip } from '@/utils/queueToTrip'; // ← alias form
import React, { useEffect } from 'react';
import { ActivityIndicator, Button, FlatList, RefreshControl, Text, View } from 'react-native';
import { useDriverTrips } from '../../hooks/useDriverTrips';
import { useTripQueue } from '../../hooks/useTripQueue';

export default function TripsScreen() {
  const {
    trips,
    loading,
    refreshing,
    error,
    loadMore,
    refresh,
    appendTripOptimistic,
  } = useDriverTrips();

  const {
    queue,
    flushing,
    addTrip,
    flush,
  } = useTripQueue({ autoFlush: true });

  // When queue items get serverId after flush, optimistically append
  useEffect(() => {
    queue.forEach(q => {
      if (q.status === 'sent' && q.serverId) {
        appendTripOptimistic(queueItemToTrip(q));
      }
    });
  }, [queue, appendTripOptimistic]);

  return (
    <View style={{ flex: 1 }}>
      {error && <Text style={{ color: 'red', padding: 8 }}>{error}</Text>}
      <View style={{ flexDirection: 'row', padding: 8, gap: 12 }}>
        <Button
          title="Add Test Trip"
          onPress={() =>
            addTrip({
              route: 'Morning Route',
              miles: 12.4,
              earnings: 18.5,
              trip_date: new Date().toISOString().slice(0, 10),
              status: 'Active',
              impressions: 250,
            })
          }
        />
        <Button title="Force Flush" onPress={flush} disabled={flushing} />
      </View>

      {queue.length > 0 && (
        <Text style={{ paddingHorizontal: 8, color: '#555' }}>
          Pending: {queue.filter(q => q.status !== 'sent').length} (flushing: {flushing ? 'yes' : 'no'})
        </Text>
      )}

      <FlatList
        data={trips}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => loadMore()}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 12,
              borderBottomWidth: 1,
              borderColor: '#eee',
              backgroundColor: item.id < 0 ? '#fff9e6' : '#fff',
            }}
          >
            <Text style={{ fontWeight: '600' }}>{item.route}</Text>
            <Text style={{ fontSize: 12, opacity: 0.7 }}>
              {item.date} • {item.miles} mi • ${item.earnings.toFixed(2)}
            </Text>
          </View>
        )}
        ListFooterComponent={() =>
          loading ? (
            <ActivityIndicator style={{ marginVertical: 16 }} />
          ) : null
        }
        ListEmptyComponent={() =>
          !loading && !refreshing ? (
            <Text style={{ padding: 20, textAlign: 'center', opacity: 0.6 }}>
              No trips yet.
            </Text>
          ) : null
        }
      />
    </View>
  );
}
