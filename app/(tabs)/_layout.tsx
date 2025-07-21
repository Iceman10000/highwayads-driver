// app/(tabs)/_layout.tsx
import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

type SimpleTabBarProps = {
  state: any;
  navigation: any;
};

function FloatingHomeTabBar({ state, navigation }: SimpleTabBarProps) {
  // Only two (or three) screens: home, driver-dashboard, trips?
  const focusedRoute = state.routes[state.index];
  const isHome = focusedRoute.name === 'home'; 
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
