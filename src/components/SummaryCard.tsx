import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

interface SummaryCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBg?: string;
  valueColor?: string;
}

export default function SummaryCard({
  label,
  value,
  icon,
  iconBg = theme.primaryDark,
  valueColor = theme.text,
}: SummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={styles.info}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  label: {
    color: theme.textMuted,
    fontSize: 13,
    marginBottom: 2,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
  },
});
