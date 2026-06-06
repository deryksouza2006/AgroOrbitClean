import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import { ClipboardList } from 'lucide-react-native';
import { Recommendation } from '../types/Recommendation';
import { recommendationService } from '../services/recommendationService';
import { theme } from '../constants/theme';
import ScreenContainer from '../components/ScreenContainer';
import RecommendationCard from '../components/RecommendationCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

export default function RecommendationsScreen() {
  const navigation = useNavigation();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await recommendationService.getAll();
      setRecommendations(data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar as recomendações.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <ScreenContainer
      title="Recomendações"
      subtitle="Ações sugeridas pelo sistema com base na análise de dados."
      onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    >
      {loading ? (
        <LoadingState />
      ) : recommendations.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={48} color={theme.textMuted} />}
          title="Nenhuma recomendação"
          description="O sistema ainda não gerou recomendações."
        />
      ) : (
        recommendations.map((rec) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
          />
        ))
      )}
    </ScreenContainer>
  );
}
