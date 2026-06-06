import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TriangleAlert, CheckCircle, Clock } from 'lucide-react-native';
import { ClimateAlert } from '../types/ClimateAlert';
import { theme } from '../constants/theme';
import StatusBadge from './StatusBadge';
import {
  getAlertStatusColor,
  getAlertStatusLabel,
  getSeverityColor,
  getSeverityLabel,
} from '../utils/statusHelpers';
import { formatDate } from '../utils/formatDate';

interface AlertCardProps {
  alert: ClimateAlert;
  onResolve: () => void;
}

export default function AlertCard({ alert, onResolve }: AlertCardProps) {
  const isResolved = alert.status === 'RESOLVED';

  return (
    <View style={[styles.card, isResolved && styles.cardResolved]}>
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${getSeverityColor(alert.severity)}22` }]}>
          <TriangleAlert size={18} color={getSeverityColor(alert.severity)} />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{alert.title}</Text>
          <View style={styles.badgeRow}>
            <StatusBadge
              label={getSeverityLabel(alert.severity)}
              color={getSeverityColor(alert.severity)}
              size="sm"
            />
            <StatusBadge
              label={getAlertStatusLabel(alert.status)}
              color={getAlertStatusColor(alert.status)}
              size="sm"
            />
          </View>
          <View style={styles.dateRow}>
            <Clock size={12} color={theme.textMuted} />
            <Text style={styles.date}>{formatDate(alert.createdAt)}</Text>
          </View>
        </View>
        {!isResolved && (
          <TouchableOpacity style={styles.resolveBtn} onPress={onResolve}>
            <CheckCircle size={14} color={theme.primary} />
            <Text style={styles.resolveLabel}>Marcar como resolvido</Text>
          </TouchableOpacity>
        )}
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
    padding: 14,
    marginBottom: 10,
  },
  cardResolved: {
    opacity: 0.7,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    color: theme.textMuted,
    fontSize: 12,
  },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.surfaceLight,
    borderRadius: 8,
    padding: 8,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  resolveLabel: {
    color: theme.primary,
    fontSize: 11,
    fontWeight: '600',
  },
});
