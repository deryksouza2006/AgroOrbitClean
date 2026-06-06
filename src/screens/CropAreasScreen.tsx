import React, { useCallback, useState } from 'react';
import { Alert, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Plus, Sprout } from 'lucide-react-native';
import { CropArea } from '../types/CropArea';
import { cropAreaService } from '../services/cropAreaService';
import { farmService } from '../services/farmService';
import { useAuth } from '../contexts/AuthContext';
import { CropAreasStackParamList } from '../navigation/types';
import { theme } from '../constants/theme';
import ScreenContainer from '../components/ScreenContainer';
import CropAreaCard from '../components/CropAreaCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

type Props = NativeStackScreenProps<CropAreasStackParamList, 'CropAreasScreen'>;

export default function CropAreasScreen({ navigation, route }: Props) {
  const drawerNav = useNavigation();
  const [cropAreas, setCropAreas] = useState<CropArea[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const mode = route.params?.mode ?? 'all';
  const selectedFarmId = route.params?.farmId;
  const selectedFarmName = route.params?.farmName;
  const isFarmScoped = mode === 'farm' && selectedFarmId != null;

  const load = useCallback(async () => {
    if (!user?.id) {
      setCropAreas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (mode === 'farm' && selectedFarmId != null) {
        const userFarms = await farmService.getAll(user.id);
        const belongsToUser = userFarms.some((farm) => farm.id === selectedFarmId);

        if (!belongsToUser) {
          setCropAreas([]);
          return;
        }

        const data = await cropAreaService.getByFarmId(selectedFarmId);
        setCropAreas(data);
        return;
      }

      const userFarms = await farmService.getAll(user.id);
      const farmIds = userFarms.map((f) => f.id);
      const data = await cropAreaService.getAll(farmIds);
      setCropAreas(data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os talhões.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, mode, selectedFarmId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function handleDelete(area: CropArea) {
    Alert.alert(
      'Excluir talhão',
      `Deseja excluir "${area.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await cropAreaService.remove(area.id);
              setCropAreas((prev) => prev.filter((c) => c.id !== area.id));
              Alert.alert('Sucesso', 'Talhão excluído.');
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir o talhão.');
            }
          },
        },
      ],
    );
  }

  return (
    <ScreenContainer
      title={isFarmScoped && selectedFarmName ? `Talhões de ${selectedFarmName}` : 'Talhões'}
      subtitle={isFarmScoped ? 'Talhões vinculados a esta fazenda.' : 'Monitoramento detalhado de cada área de plantio.'}
      onMenuPress={() => drawerNav.dispatch(DrawerActions.openDrawer())}
      headerRight={
        !loading && cropAreas.length > 0 ? (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('CropAreaForm', {})}
          >
            <Plus size={16} color={theme.background} />
            <Text style={styles.addBtnLabel}>Novo talhão</Text>
          </TouchableOpacity>
        ) : undefined
      }
    >
      {loading ? (
        <LoadingState />
      ) : cropAreas.length === 0 ? (
        <EmptyState
          icon={<Sprout size={48} color={theme.textMuted} />}
          title={isFarmScoped ? 'Nenhum talhão nesta fazenda' : 'Nenhum talhão cadastrado'}
          description={isFarmScoped ? 'Cadastre um talhão para esta fazenda ou volte para ver todos os talhões.' : 'Cadastre um talhão para monitorar suas áreas de plantio.'}
          actionLabel="+ Novo talhão"
          onAction={() => navigation.navigate('CropAreaForm', {})}
        />
      ) : (
        cropAreas.map((area) => (
          <CropAreaCard
            key={area.id}
            cropArea={area}
            onViewDetails={() =>
              navigation.navigate('CropAreaDetails', { cropAreaId: area.id })
            }
            onEdit={() =>
              navigation.navigate('CropAreaForm', { cropAreaId: area.id })
            }
            onDelete={() => handleDelete(area)}
          />
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  addBtnLabel: {
    color: theme.background,
    fontWeight: '700',
    fontSize: 13,
  },
});
