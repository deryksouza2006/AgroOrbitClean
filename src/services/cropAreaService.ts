import { CropArea } from '../types/CropArea';
import api from './api';
import { apiRoutes } from '../constants/apiRoutes';
import { extractPageContent, fromApiCropArea, toApiCropAreaRequest } from '../utils/apiMappers';

export const cropAreaService = {
  async getAll(allowedFarmIds?: number[]): Promise<CropArea[]> {
    // No mobile, talhões sempre devem ser filtrados pelas fazendas do usuário logado.
    // Sem fazendas permitidas, retorna vazio e evita exibir dados de outra conta.
    if (!allowedFarmIds || allowedFarmIds.length === 0) {
      return [];
    }

    try {
      const response = await api.get(apiRoutes.cropAreas.list);
      const raw = extractPageContent<Record<string, unknown>>(response.data);
      const areas = raw.map(fromApiCropArea);
      return areas.filter((a) => allowedFarmIds.includes(a.farmId));
    } catch {
      throw new Error('Não foi possível carregar os talhões. Verifique sua conexão.');
    }
  },

  async getById(id: number): Promise<CropArea> {
    try {
      const response = await api.get(apiRoutes.cropAreas.detail(id));
      return fromApiCropArea(response.data as Record<string, unknown>);
    } catch {
      throw new Error('Talhão não encontrado.');
    }
  },

  async getByFarmId(farmId: number): Promise<CropArea[]> {
    try {
      const response = await api.get(apiRoutes.farms.cropAreas(farmId));
      const raw = extractPageContent<Record<string, unknown>>(response.data);
      return raw.map(fromApiCropArea);
    } catch {
      throw new Error('Não foi possível carregar os talhões desta fazenda.');
    }
  },

  async create(data: Omit<CropArea, 'id'>): Promise<CropArea> {
    try {
      const payload = toApiCropAreaRequest(data);
      const response = await api.post(apiRoutes.cropAreas.list, payload);
      return fromApiCropArea(response.data as Record<string, unknown>);
    } catch {
      throw new Error('Não foi possível cadastrar o talhão.');
    }
  },

  async update(id: number, data: Partial<CropArea>): Promise<CropArea> {
    try {
      const payload = toApiCropAreaRequest(data as Omit<CropArea, 'id'>);
      const response = await api.put(apiRoutes.cropAreas.detail(id), payload);
      return fromApiCropArea(response.data as Record<string, unknown>);
    } catch {
      throw new Error('Não foi possível atualizar o talhão.');
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await api.delete(apiRoutes.cropAreas.detail(id));
    } catch {
      throw new Error('Não foi possível excluir o talhão.');
    }
  },
};
