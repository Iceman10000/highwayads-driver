// app/(tabs)/_layout.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Colors from '../../constants/Colors';

type SimpleTabBarProps = {
  state: any;
  navigation: any;
};

function FloatingHomeTabBar({ state, navigation }: SimpleTabBarProps) {
  // Only two (or three) screens: home, driver-dashboard, trips?
  const focusedRoute = state.routes[state.index];
  const isHome = focusedRoute.name === 'home';

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <Pressable
        onPress={() => {
          if (!isHome) navigation.navigate('home');
        }}
        style={({ pressed }) => [
          styles.pill,
          isHome && styles.pillActive,
          pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
        ]}
      >
        <MaterialIcons
          name="home"
            size={24}
            color={isHome ? '#fff' : Colors.primary}
        />
        <Text style={[styles.pillLabel, isHome && styles.pillLabelActive]}>
          Home
        </Text>
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
      tabBar={(props) => <FloatingHomeTabBar {...props} />}
    >
      <Tabs.Screen name="home" options={{}} />
      <Tabs.Screen
        name="driver-dashboard"
        options={{
          href: '/driver-dashboard',
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          href: '/trips',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 18,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.highlight,
    borderColor: Colors.highlight,
  },
  pillLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  pillLabelActive: {
    color: '#ffffff',
  },
});
