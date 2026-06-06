import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Lightbulb, ArrowRight } from 'lucide-react-native';
import { Recommendation } from '../types/Recommendation';
import { theme } from '../constants/theme';
import StatusBadge from './StatusBadge';
import { getPriorityColor, getPriorityLabel } from '../utils/statusHelpers';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Lightbulb size={18} color={theme.primary} />
        </View>
        <View style={styles.body}>
          <Text style={styles.title}>
            {recommendation.title}
          </Text>
          <View style={styles.meta}>
            <StatusBadge
              label={getPriorityLabel(recommendation.priority)}
              color={getPriorityColor(recommendation.priority)}
              size="sm"
            />
            {recommendation.description && (
              <View style={styles.descRow}>
                <ArrowRight size={11} color={theme.textMuted} />
                <Text style={styles.desc}>{recommendation.description}</Text>
              </View>
            )}
          </View>
        </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: `${theme.primary}22`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  body: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  meta: {
    gap: 4,
  },
  descRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  desc: {
    color: theme.textMuted,
    fontSize: 12,
  },
});
