import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sprout, Map, Activity, Wifi, Pencil, Trash2 } from 'lucide-react-native';
import { CropArea } from '../types/CropArea';
import { theme } from '../constants/theme';
import StatusBadge from './StatusBadge';
import {
  getCropAreaStatusColor,
  getCropAreaStatusLabel,
  getNdviColor,
  getAreaUnitLabel,
} from '../utils/statusHelpers';
import { formatRelativeTime } from '../utils/formatDate';

interface CropAreaCardProps {
  cropArea: CropArea;
  onViewDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CropAreaCard({ cropArea, onViewDetails, onEdit, onDelete }: CropAreaCardProps) {
  const ndviColor = cropArea.ndvi != null ? getNdviColor(cropArea.ndvi) : theme.textMuted;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{cropArea.name}</Text>
        <StatusBadge
          label={getCropAreaStatusLabel(cropArea.status)}
          color={getCropAreaStatusColor(cropArea.status)}
        />
      </View>

      <View style={styles.cropRow}>
        <Sprout size={14} color={theme.primary} />
        <Text style={styles.crop}>{cropArea.crop}</Text>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Map size={13} color={theme.textMuted} />
          <Text style={styles.metricLabel}>Área</Text>
          <Text style={styles.metricValue}>
            {cropArea.areaSize} {getAreaUnitLabel(cropArea.areaUnit)}
          </Text>
        </View>
        {cropArea.ndvi != null && (
          <View style={styles.metric}>
            <Activity size={13} color={ndviColor} />
            <Text style={styles.metricLabel}>NDVI</Text>
            <Text style={[styles.metricValue, { color: ndviColor }]}>
              {cropArea.ndvi.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      {cropArea.lastReadingAt && (
        <View style={styles.readingRow}>
          <Wifi size={13} color={theme.textMuted} />
          <Text style={styles.readingText}>
            Última leitura: {formatRelativeTime(cropArea.lastReadingAt)}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={onViewDetails} activeOpacity={0.8}>
          <Text style={styles.primaryBtnLabel}>Ver detalhes</Text>
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
    marginBottom: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  name: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  cropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  crop: {
    color: theme.textMuted,
    fontSize: 13,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  metric: {
    alignItems: 'center',
    gap: 2,
  },
  metricLabel: {
    color: theme.textMuted,
    fontSize: 11,
  },
  metricValue: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '700',
  },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 14,
  },
  readingText: {
    color: theme.textMuted,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: theme.surfaceLight,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  primaryBtnLabel: {
    color: theme.text,
    fontWeight: '600',
    fontSize: 14,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.surfaceLight,
  },
});
