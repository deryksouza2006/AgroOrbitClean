import { SatelliteData } from '../types/SatelliteData';
import api from './api';
import { apiRoutes } from '../constants/apiRoutes';
import { extractPageContent, fromApiSatelliteData, toApiSatelliteDataRequest } from '../utils/apiMappers';

async function getAllPages(route: string): Promise<Record<string, unknown>[]> {
  const allItems: Record<string, unknown>[] = [];
  let page = 0;
  const size = 100;
  let totalPages = 1;

  do {
    const response = await api.get(route, {
      params: { page, size },
    });

    const pageItems = extractPageContent<Record<string, unknown>>(response.data);
    allItems.push(...pageItems);

    if (response.data && typeof response.data === 'object' && 'totalPages' in response.data) {
      totalPages = Number((response.data as { totalPages?: number }).totalPages ?? 1);
    } else {
      totalPages = 1;
    }

    page += 1;
  } while (page < totalPages);

  return allItems;
}

export const satelliteDataService = {
  async getAll(): Promise<SatelliteData[]> {
    try {
      const raw = await getAllPages(apiRoutes.satelliteData.list);
      return raw.map(fromApiSatelliteData);
    } catch {
      throw new Error('Não foi possível carregar os dados satelitais.');
    }
  },

  async getByCropArea(cropAreaId: number): Promise<SatelliteData[]> {
    try {
      const raw = await getAllPages(apiRoutes.cropAreas.satelliteData(cropAreaId));
      return raw.map((item) => ({
        ...fromApiSatelliteData(item),
        cropAreaId: fromApiSatelliteData(item).cropAreaId || cropAreaId,
      }));
    } catch {
      throw new Error('Não foi possível carregar os dados satelitais deste talhão.');
    }
  },

  async create(data: Omit<SatelliteData, 'id'>): Promise<SatelliteData> {
    try {
      const payload = toApiSatelliteDataRequest(data);
      const response = await api.post(apiRoutes.satelliteData.list, payload);
      return fromApiSatelliteData(response.data as Record<string, unknown>);
    } catch {
      throw new Error('Não foi possível registrar os dados satelitais.');
    }
  },

  async update(id: number, data: Partial<SatelliteData>): Promise<SatelliteData> {
    try {
      const response = await api.put(apiRoutes.satelliteData.detail(id), data);
      return fromApiSatelliteData(response.data as Record<string, unknown>);
    } catch {
      throw new Error('Não foi possível atualizar os dados satelitais.');
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await api.delete(apiRoutes.satelliteData.detail(id));
    } catch {
      throw new Error('Não foi possível excluir os dados satelitais.');
    }
  },
};
