import React, { useCallback, useState } from 'react';
import { Alert, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Plus, Map } from 'lucide-react-native';
import { Farm } from '../types/Farm';
import { farmService } from '../services/farmService';
import { cropAreaService } from '../services/cropAreaService';
import { useAuth } from '../contexts/AuthContext';
import { DrawerParamList, FarmsStackParamList } from '../navigation/types';
import { theme } from '../constants/theme';
import ScreenContainer from '../components/ScreenContainer';
import FarmCard from '../components/FarmCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

type Props = NativeStackScreenProps<FarmsStackParamList, 'FarmsScreen'>;

export default function FarmsScreen({ navigation }: Props) {
  const drawerNav = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) {
      setFarms([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await farmService.getAll(user.id);

      // Buscar talhões de todas as fazendas para calcular cropAreasCount
      const farmIds = data.map((f) => f.id);
      let cropAreas: { farmId: number }[] = [];
      try {
        cropAreas = await cropAreaService.getAll(farmIds);
      } catch {
        // Se falhar, continua com cropAreasCount = 0
      }

      // Calcular cropAreasCount para cada fazenda
      const farmsWithCount = data.map((farm) => ({
        ...farm,
        cropAreasCount: cropAreas.filter((area) => area.farmId === farm.id).length,
      }));

      setFarms(farmsWithCount);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar as fazendas.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function handleDelete(farm: Farm) {
    Alert.alert(
      'Excluir fazenda',
      `Deseja excluir "${farm.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await farmService.remove(farm.id);
              setFarms((prev) => prev.filter((f) => f.id !== farm.id));
              Alert.alert('Sucesso', 'Fazenda excluída.');
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir a fazenda.');
            }
          },
        },
      ],
    );
  }

  return (
    <ScreenContainer
      title="Fazendas"
      subtitle="Gerencie suas propriedades e visualize o status geral."
      onMenuPress={() => drawerNav.dispatch(DrawerActions.openDrawer())}
      headerRight={
        !loading && farms.length > 0 ? (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('FarmForm', {})}
          >
            <Plus size={16} color={theme.background} />
            <Text style={styles.addBtnLabel}>Nova fazenda</Text>
          </TouchableOpacity>
        ) : undefined
      }
    >
      {loading ? (
        <LoadingState />
      ) : farms.length === 0 ? (
        <EmptyState
          icon={<Map size={48} color={theme.textMuted} />}
          title="Nenhuma fazenda cadastrada"
          description="Cadastre sua primeira fazenda para começar a monitorar."
          actionLabel="+ Nova fazenda"
          onAction={() => navigation.navigate('FarmForm', {})}
        />
      ) : (
        farms.map((farm) => (
          <FarmCard
            key={farm.id}
            farm={farm}
            onViewCropAreas={() => {
              drawerNav.navigate('Talhões', {
                screen: 'CropAreasScreen',
                params: {
                  mode: 'farm',
                  farmId: farm.id,
                  farmName: farm.name,
                },
              });
            }}
            onEdit={() => navigation.navigate('FarmForm', { farmId: farm.id })}
            onDelete={() => handleDelete(farm)}
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
