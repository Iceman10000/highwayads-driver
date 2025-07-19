// app/(tabs)/_layout.tsx
import { MaterialIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  GestureResponderEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Colors from '../../constants/Colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="driver-dashboard" options={{ title: 'Dashboard' }} />
    </Tabs>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Floating / Animated Custom Tab Bar
 * ──────────────────────────────────────────────────────────────── */
function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // Hide the focused route → only show others
  const visibleRoutes = state.routes.filter((_, idx) => idx !== state.index);
  const isSingle = visibleRoutes.length === 1;

  // Master animation (appear)
  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    appear.setValue(0);
    Animated.spring(appear, {
      toValue: 1,
      friction: 6,
      tension: 110,
      useNativeDriver: true,
    }).start();
  }, [state.index, visibleRoutes.length]);

  if (visibleRoutes.length === 0) return null;

  // Common mapping for each button
  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {/* Container chooses single vs multi style */}
      <Animated.View
        style={[
          isSingle ? styles.singleWrapper : styles.multiWrapper,
          Platform.OS === 'web' && styles.webShadow,
          {
            transform: [
              {
                scale: appear.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.85, 1],
                }),
              },
              {
                translateY: appear.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
            opacity: appear,
          },
        ]}
      >
        {visibleRoutes.map((route) => {
          const { options } = descriptors[route.key];

            const rawLabel =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const labelText =
              typeof rawLabel === 'string' ? rawLabel : route.name;

          const iconName =
            route.name === 'home' ? 'home' : 'dashboard';

          return (
            <FloatingTabButton
              key={route.key}
              label={labelText}
              iconName={iconName}
              onPress={() => navigation.navigate(route.name)}
              single={isSingle}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

/* Individual Button with press animation */
interface FloatingTabButtonProps {
  label: string;
  iconName: string;
  onPress: (e: GestureResponderEvent) => void;
  single: boolean;
}

function FloatingTabButton({ label, iconName, onPress, single }: FloatingTabButtonProps) {
  const pressAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.timing(pressAnim, {
      toValue: 1,
      duration: 110,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.timing(pressAnim, {
      toValue: 0,
      duration: 140,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const scale = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.94],
  });

  const elevation = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 2],
  });

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Animated.View
        style={[
          single ? styles.singleTabButton : styles.multiTabButton,
          {
            transform: [{ scale }],
            shadowOpacity: single ? 0.18 : 0.12,
            elevation,
          },
        ]}
      >
        <MaterialIcons
          name={iconName as any}
          size={single ? 26 : 22}
          color={Colors.primary}
          style={{ marginRight: 8 }}
        />
        <Text style={styles.tabLabel}>{label}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Styles
 * ──────────────────────────────────────────────────────────────── */
const BAR_HORIZONTAL_MARGIN = 16;

const styles = StyleSheet.create({
  /* For single pill we center at bottom with some spacing */
  singleWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 14,
    alignItems: 'center',
  },
  multiWrapper: {
    position: 'absolute',
    left: BAR_HORIZONTAL_MARGIN,
    right: BAR_HORIZONTAL_MARGIN,
    bottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  webShadow: {
    // Extra subtle global drop for web
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  singleTabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 40,
    shadowColor: '#000',
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    elevation: 8,
  },
  multiTabButton: {
    flex: 1,
    marginHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    shadowColor: '#000',
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    elevation: 6,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 0.4,
  },
});

export { };

