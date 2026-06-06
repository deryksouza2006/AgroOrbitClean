import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Sprout, Pencil, Trash2 } from 'lucide-react-native';
import { Farm } from '../types/Farm';
import { theme } from '../constants/theme';
import StatusBadge from './StatusBadge';
import { getFarmStatusColor, getFarmStatusLabel } from '../utils/statusHelpers';

interface FarmCardProps {
  farm: Farm;
  onViewCropAreas: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function FarmCard({ farm, onViewCropAreas, onEdit, onDelete }: FarmCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{farm.name}</Text>
        <StatusBadge
          label={getFarmStatusLabel(farm.status)}
          color={getFarmStatusColor(farm.status)}
        />
      </View>

      <View style={styles.locationRow}>
        <MapPin size={14} color={theme.textMuted} />
        <Text style={styles.location}>{farm.city}, {farm.state}</Text>
      </View>

      <View style={styles.cropRow}>
        <Sprout size={14} color={theme.primary} />
        <Text style={styles.cropCount}>
          Talhões: <Text style={styles.cropCountBold}>{farm.cropAreasCount ?? 0}</Text>
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={onViewCropAreas} activeOpacity={0.8}>
          <Text style={styles.primaryBtnLabel}>Ver talhões</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={onEdit}>
          <Pencil size={18} color={theme.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={onDelete}>
          <Trash2 size={18} color={theme.red} />
        </TouchableOpacity>
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
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  name: {
    color: theme.text,
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  location: {
    color: theme.textMuted,
    fontSize: 13,
  },
  cropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  cropCount: {
    color: theme.textMuted,
    fontSize: 13,
  },
  cropCountBold: {
    color: theme.text,
    fontWeight: '700',
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: theme.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    flex: 1,
    alignItems: 'center',
  },
  primaryBtnLabel: {
    color: theme.background,
    fontWeight: '700',
    fontSize: 14,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.surfaceLight,
  },
});
