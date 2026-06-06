import { Recommendation } from '../types/Recommendation';
import api from './api';
import { apiRoutes } from '../constants/apiRoutes';
import { extractPageContent, fromApiRecommendation } from '../utils/apiMappers';

export const recommendationService = {
  async getAll(): Promise<Recommendation[]> {
    try {
      const response = await api.get(apiRoutes.recommendations.list);
      const raw = extractPageContent<Record<string, unknown>>(response.data);
      return raw.map(fromApiRecommendation);
    } catch {
      throw new Error('Não foi possível carregar as recomendações. Verifique sua conexão.');
    }
  },

  async getById(id: number): Promise<Recommendation> {
    try {
      const response = await api.get(apiRoutes.recommendations.detail(id));
      return fromApiRecommendation(response.data as Record<string, unknown>);
    } catch {
      throw new Error('Recomendação não encontrada.');
    }
  },

  async getByCropArea(cropAreaId: number): Promise<Recommendation[]> {
    try {
      const response = await api.get(apiRoutes.cropAreas.recommendations(cropAreaId));
      const raw = extractPageContent<Record<string, unknown>>(response.data);
      return raw.map(fromApiRecommendation);
    } catch {
      // Retorna array vazio se a rota não existir ou falhar
      return [];
    }
  },
};
