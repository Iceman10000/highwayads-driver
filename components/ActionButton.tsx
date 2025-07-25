import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  background?: string;
}

export default function ActionButton({ icon, label, onPress, background = '#40916c' }: ActionButtonProps) {
  return (
    <TouchableOpacity style={[styles.button, { backgroundColor: background }]} onPress={onPress}>
      <FontAwesome name={icon as any} size={20} color="#fff" style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
  },
  icon: {
    marginRight: 10,
  },
  label: {
    color: '#fff',
    fontSize: 16,
  },
});
