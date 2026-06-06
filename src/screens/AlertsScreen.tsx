import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import { TriangleAlert } from 'lucide-react-native';
import { ClimateAlert, AlertStatus } from '../types/ClimateAlert';
import { alertService } from '../services/alertService';
import { theme } from '../constants/theme';
import ScreenContainer from '../components/ScreenContainer';
import AlertCard from '../components/AlertCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

type FilterKey = 'ALL' | AlertStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'OPEN', label: 'Abertos' },
  { key: 'IN_ANALYSIS', label: 'Em análise' },
  { key: 'RESOLVED', label: 'Resolvidos' },
];

export default function AlertsScreen() {
  const navigation = useNavigation();
  const [alerts, setAlerts] = useState<ClimateAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await alertService.getAll();
      setAlerts(data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os alertas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function handleResolve(id: number) {
    try {
      await alertService.resolveAlert(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'RESOLVED' as const } : a)));
      Alert.alert('Sucesso', 'Alerta marcado como resolvido.');
    } catch {
      Alert.alert('Erro', 'Não foi possível resolver o alerta.');
    }
  }

  const filtered = activeFilter === 'ALL'
    ? alerts
    : alerts.filter((a) => a.status === activeFilter);

  return (
    <ScreenContainer
      title="Alertas"
      subtitle="Gerencie os alertas gerados por satélite e IoT."
      onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    >
      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, activeFilter === f.key && styles.filterBtnActive]}
            onPress={() => setActiveFilter(f.key)}
          >
            <Text style={[styles.filterLabel, activeFilter === f.key && styles.filterLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<TriangleAlert size={48} color={theme.textMuted} />}
          title="Nenhum alerta encontrado"
          description="Não há alertas para o filtro selecionado."
        />
      ) : (
        filtered.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onResolve={() => handleResolve(alert.id)}
          />
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  filterBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceLight,
  },
  filterBtnActive: {
    backgroundColor: theme.surface,
    borderColor: theme.primary,
  },
  filterLabel: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  filterLabelActive: {
    color: theme.primary,
  },
});
