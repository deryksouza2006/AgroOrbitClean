import { Farm } from '../types/Farm';
import api from './api';
import { apiRoutes } from '../constants/apiRoutes';
import { extractPageContent, fromApiFarm, toApiFarmRequest } from '../utils/apiMappers';

export const farmService = {
  async getAll(userId?: number): Promise<Farm[]> {
    if (userId == null) {
      return [];
    }

    try {
      const allRaw: Record<string, unknown>[] = [];
      let page = 0;
      let totalPages = 1;
      const size = 100;

      do {
        const response = await api.get(apiRoutes.farms.list, {
          params: { page, size },
        });

        const raw = extractPageContent<Record<string, unknown>>(response.data);
        allRaw.push(...raw);

        const data = response.data as Record<string, unknown>;
        const apiTotalPages = typeof data.totalPages === 'number' ? data.totalPages : 1;
        const isLast = typeof data.last === 'boolean' ? data.last : true;

        totalPages = apiTotalPages;

        if (isLast) {
          break;
        }

        page += 1;
      } while (page < totalPages);

      return allRaw
        .map(fromApiFarm)
        .filter((farm) => farm.userId === userId);
    } catch {
      throw new Error('Não foi possível carregar as fazendas. Verifique sua conexão.');
    }
  },

  async getById(id: number): Promise<Farm> {
    try {
      const response = await api.get(apiRoutes.farms.detail(id));
      return fromApiFarm(response.data as Record<string, unknown>);
    } catch {
      throw new Error('Fazenda não encontrada.');
    }
  },

  async create(data: Omit<Farm, 'id'>, userId: number): Promise<Farm> {
    try {
      const payload = toApiFarmRequest(data, userId);
      const response = await api.post(apiRoutes.farms.list, payload);
      return fromApiFarm(response.data as Record<string, unknown>);
    } catch {
      throw new Error('Não foi possível cadastrar a fazenda.');
    }
  },

  async update(id: number, data: Partial<Farm>, userId: number): Promise<Farm> {
    try {
      const payload = toApiFarmRequest(data as Omit<Farm, 'id'>, userId);
      const response = await api.put(apiRoutes.farms.detail(id), payload);
      return fromApiFarm(response.data as Record<string, unknown>);
    } catch {
      throw new Error('Não foi possível atualizar a fazenda.');
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await api.delete(apiRoutes.farms.detail(id));
    } catch {
      throw new Error('Não foi possível excluir a fazenda.');
    }
  },
};
