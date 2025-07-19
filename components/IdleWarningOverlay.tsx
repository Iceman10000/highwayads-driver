// components/IdleWarningOverlay.tsx
import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Colors from '../constants/Colors';
import { useAuth } from './AuthProvider';

export default function IdleWarningOverlay() {
  const { showIdleWarning, dismissIdleWarning, logout } = useAuth();

  return (
    <Modal
      visible={showIdleWarning}
      transparent
      animationType="fade"
      onRequestClose={dismissIdleWarning}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Are you still there?</Text>
          <Text style={styles.msg}>
            You’ll be logged out in 2 minutes due to inactivity.
            Tap **Stay Logged In** to continue your session.
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.primary]}
              onPress={dismissIdleWarning}
              activeOpacity={0.88}
            >
              <Text style={styles.btnText}>Stay Logged In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.outline]}
              onPress={() => logout('manual')}
              activeOpacity={0.88}
            >
              <Text style={[styles.btnText, styles.outlineText]}>Logout Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 28,
  },
  card: {
    borderRadius: 24,
    backgroundColor: Colors.card || '#fff',
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
  },
  msg: {
    fontSize: 14.5,
    lineHeight: 20,
    color: Colors.primary,
    opacity: 0.85,
    marginBottom: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  btn: {
    flexGrow: 1,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
    paddingHorizontal: 16,
  },
  primary: {
    backgroundColor: Colors.highlight || '#40916c',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.highlight || '#40916c',
  },
  btnText: {
    color: Colors.white || '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  outlineText: {
    color: Colors.highlight || '#40916c',
  },
});
