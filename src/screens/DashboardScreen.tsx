import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Map as MapIcon,
  Sprout,
  Wifi,
  TriangleAlert,
  Activity,
  BarChart3,
} from 'lucide-react-native';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import { Dashboard, NdviPoint } from '../types/Dashboard';
import { theme } from '../constants/theme';
import { farmService } from '../services/farmService';
import { cropAreaService } from '../services/cropAreaService';
import { sensorService } from '../services/sensorService';
import { alertService } from '../services/alertService';
import { satelliteDataService } from '../services/satelliteDataService';
import { useAuth } from '../contexts/AuthContext';
import { getSeverityColor, getCropAreaStatusLabel, getCropAreaStatusColor } from '../utils/statusHelpers';
import { formatDate } from '../utils/formatDate';
import ScreenContainer from '../components/ScreenContainer';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import NdviLineChart from '../components/NdviLineChart';

function createEmptyDashboard(): Dashboard {
  return {
    farmsCount: 0,
    cropAreasCount: 0,
    activeSensors: 0,
    openAlerts: 0,
    avgNdvi: 0,
    generalStatus: 'Sem dados',
    ndviHistory: [],
    recentAlerts: [],
    criticalCropAreas: [],
  };
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) {
      setData(createEmptyDashboard());
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      let farms: { id: number; userId?: number; name: string }[] = [];
      try {
        farms = await farmService.getAll(user?.id);
      } catch {
        farms = [];
      }
      const farmIds = farms.map((f) => f.id);
      let cropAreas: { id: number; farmId: number; status: string; ndvi?: number; name: string }[] = [];
      try {
        cropAreas = await cropAreaService.getAll(farmIds);
      } catch {
        cropAreas = [];
      }
      const cropAreaIds = cropAreas.map((a) => a.id);
      const [sensorsResult, alertsResult, satResult] = await Promise.allSettled([
        sensorService.getAll(),
        alertService.getAll(),
        satelliteDataService.getAll(),
      ]);

      let activeSensorsCount = 0;
      if (sensorsResult.status === 'fulfilled') {
        const userSensors = sensorsResult.value.filter((s) => cropAreaIds.includes(s.cropAreaId));
        activeSensorsCount = userSensors.filter((s) => s.status === 'ACTIVE').length;
      }

      let userAlerts: { id: number; title: string; severity: string; status: string; createdAt: string; cropAreaId?: number }[] = [];
      if (alertsResult.status === 'fulfilled') {
        userAlerts = alertsResult.value.filter((a: any) => a.cropAreaId != null && cropAreaIds.includes(a.cropAreaId));
      }
      const openAlerts = userAlerts.filter((a) => a.status === 'OPEN');

      let userSatelliteData: { id: number; cropAreaId: number; ndviMean: number; ndviMin?: number; ndviMax?: number; capturedAt: string }[] = [];
      if (satResult.status === 'fulfilled') {
        userSatelliteData = satResult.value.filter((s) => cropAreaIds.includes(s.cropAreaId));
      }

      let avgNdvi = 0;
      try {
        const latestPerCropArea = new Map<number, { ndviMean: number; capturedAt: string; id: number }>();
        for (const s of userSatelliteData) {
          const existing = latestPerCropArea.get(s.cropAreaId);
          if (
            !existing ||
            s.capturedAt > existing.capturedAt ||
            (s.capturedAt === existing.capturedAt && s.id > existing.id)
          ) {
            latestPerCropArea.set(s.cropAreaId, {
              ndviMean: s.ndviMean,
              capturedAt: s.capturedAt,
              id: s.id ?? 0,
            });
          }
        }
        const latestRecords = [...latestPerCropArea.values()];
        if (latestRecords.length > 0) {
          const sum = latestRecords.reduce((acc, r) => acc + r.ndviMean, 0);
          avgNdvi = sum / latestRecords.length;
        }
      } catch {
        avgNdvi = 0;
      }

      let generalStatus = 'Sem dados';
      if (farms.length > 0) {
        const hasCritical = openAlerts.some((a) => a.severity === 'HIGH' || a.severity === 'CRITICAL');
        const hasWarning = openAlerts.length > 0;
        if (hasCritical) {
          generalStatus = 'Crítico';
        } else if (hasWarning) {
          generalStatus = 'Atenção';
        } else {
          generalStatus = 'Saudável';
        }
      }

      const ndviHistory: NdviPoint[] = [];
      try {
        if (userSatelliteData.length > 0) {
          const sortedSatelliteData = [...userSatelliteData]
            .filter((sd) => typeof sd.ndviMean === 'number' && !Number.isNaN(sd.ndviMean))
            .sort((a, b) => {
              const dateCompare = (a.capturedAt ?? '').localeCompare(b.capturedAt ?? '');
              if (dateCompare !== 0) return dateCompare;
              return (a.id ?? 0) - (b.id ?? 0);
            })
            .slice(-7);

          sortedSatelliteData.forEach((sd, index) => {
            const date = sd.capturedAt ? sd.capturedAt.substring(0, 10) : '';
            let label = `#${index + 1}`;

            if (date.includes('-')) {
              const [, month, day] = date.split('-');
              if (day && month) {
                label = `${day}/${month}`;
              }
            }

            ndviHistory.push({
              label,
              value: parseFloat(sd.ndviMean.toFixed(3)),
            });
          });
        }
      } catch {
        ndviHistory.splice(0, ndviHistory.length);
      }

      const recentAlerts = [...userAlerts]
        .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
        .slice(0, 5)
        .map((a) => ({
          id: a.id,
          title: a.title || 'Alerta',
          severity: a.severity,
          createdAt: a.createdAt,
        }));

      const criticalCropAreas = cropAreas
        .filter((a) => a.status === 'ATTENTION' || a.status === 'DROUGHT_RISK' || a.status === 'CRITICAL')
        .map((a) => ({
          id: a.id,
          name: a.name,
          status: a.status,
          ndvi: a.ndvi,
        }));

      const dashboard: Dashboard = {
        farmsCount: farms.length,
        cropAreasCount: cropAreas.length,
        activeSensors: activeSensorsCount,
        openAlerts: openAlerts.length,
        avgNdvi,
        generalStatus,
        ndviHistory,
        recentAlerts,
        criticalCropAreas,
      };

      setData(dashboard);
    } catch {
      setData(createEmptyDashboard());
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function openDrawer() {
    navigation.dispatch(DrawerActions.openDrawer());
  }

  if (loading) {
    return (
      <ScreenContainer onMenuPress={openDrawer}>
        <LoadingState />
      </ScreenContainer>
    );
  }

  if (!data) return null;

  return (
    <ScreenContainer
      title="Dashboard Geral"
      subtitle="Visão integrada das suas fazendas e sensores."
      onMenuPress={openDrawer}
    >
      <SummaryCard
        label="Fazendas cadastradas"
        value={data.farmsCount}
        icon={<MapIcon size={22} color={theme.primary} />}
        iconBg={theme.primaryDark}
      />
      <SummaryCard
        label="Talhões monitorados"
        value={data.cropAreasCount}
        icon={<Sprout size={22} color={theme.primary} />}
        iconBg={theme.primaryDark}
      />
      <SummaryCard
        label="Sensores ativos"
        value={data.activeSensors}
        icon={<Wifi size={22} color={theme.primary} />}
        iconBg={theme.primaryDark}
      />
      <SummaryCard
        label="Alertas abertos"
        value={data.openAlerts}
        icon={<TriangleAlert size={22} color={theme.red} />}
        iconBg={`${theme.red}22`}
        valueColor={theme.red}
      />
      <SummaryCard
        label="NDVI médio"
        value={data.avgNdvi.toFixed(2)}
        icon={<Activity size={22} color={theme.blue} />}
        iconBg={`${theme.blue}22`}
        valueColor={theme.blue}
      />
      <SummaryCard
        label="Status geral"
        value={data.generalStatus}
        icon={<BarChart3 size={22} color={theme.red} />}
        iconBg={`${theme.red}22`}
        valueColor={theme.red}
      />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Activity size={16} color={theme.primary} />
          <Text style={styles.sectionTitle}>Evolução do NDVI Médio (7 dias)</Text>
        </View>
        {data.ndviHistory.length > 0 ? (
          <NdviLineChart data={data.ndviHistory} />
        ) : (
          <Text style={styles.emptyText}>Sem dados de NDVI ainda</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alertas Recentes</Text>
        {data.recentAlerts.length > 0 ? (
          data.recentAlerts.map((alert) => (
            <View key={alert.id} style={styles.listItem}>
              <View style={[styles.dot, { backgroundColor: getSeverityColor(alert.severity) }]} />
              <View style={styles.listItemText}>
                <Text style={styles.listItemTitle}>{alert.title}</Text>
                <Text style={styles.listItemSub}>{formatDate(alert.createdAt)}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Nenhum alerta recente</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Talhões em Risco</Text>
        {data.criticalCropAreas.length > 0 ? (
          data.criticalCropAreas.map((area) => (
            <View key={area.id} style={styles.riskItem}>
              <Text style={styles.riskName}>{area.name}</Text>
              <View style={styles.riskRight}>
                {area.ndvi != null && (
                  <Text style={styles.riskNdvi}>NDVI {area.ndvi.toFixed(2)}</Text>
                )}
                <StatusBadge
                  label={getCropAreaStatusLabel(area.status)}
                  color={getCropAreaStatusColor(area.status)}
                  size="sm"
                />
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Nenhum talhão em risco</Text>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    marginBottom: 10,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '700',
  },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listItemText: {
    flex: 1,
  },
  listItemTitle: {
    color: theme.text,
    fontSize: 13,
    fontWeight: '600',
  },
  listItemSub: {
    color: theme.textMuted,
    fontSize: 12,
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  riskName: {
    color: theme.text,
    fontSize: 13,
    fontWeight: '600',
  },
  riskRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  riskNdvi: {
    color: theme.textMuted,
    fontSize: 12,
  },
  emptyText: {
    color: theme.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
});
