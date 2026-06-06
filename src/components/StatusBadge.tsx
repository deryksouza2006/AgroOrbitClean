import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  label: string;
  color: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ label, color, size = 'md' }: StatusBadgeProps) {
  const isSmall = size === 'sm';
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: `${color}22`, borderColor: `${color}55` },
        isSmall && styles.badgeSm,
      ]}
    >
      <Text style={[styles.label, { color }, isSmall && styles.labelSm]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  labelSm: {
    fontSize: 11,
  },
});
