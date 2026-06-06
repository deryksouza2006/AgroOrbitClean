import { ClimateAlert } from '../types/ClimateAlert';
import api from './api';
import { apiRoutes } from '../constants/apiRoutes';
import { extractPageContent, fromApiClimateAlert } from '../utils/apiMappers';

export const alertService = {
  async getAll(): Promise<ClimateAlert[]> {
    try {
      const response = await api.get(apiRoutes.alerts.list);
      const raw = extractPageContent<Record<string, unknown>>(response.data);
      return raw.map(fromApiClimateAlert);
    } catch {
      throw new Error('Não foi possível carregar os alertas. Verifique sua conexão.');
    }
  },

  async getOpen(): Promise<ClimateAlert[]> {
    try {
      const response = await api.get(apiRoutes.alerts.open);
      const raw = extractPageContent<Record<string, unknown>>(response.data);
      return raw.map(fromApiClimateAlert);
    } catch {
      throw new Error('Não foi possível carregar os alertas abertos.');
    }
  },

  async getCritical(): Promise<ClimateAlert[]> {
    try {
      const response = await api.get(apiRoutes.alerts.critical);
      const raw = extractPageContent<Record<string, unknown>>(response.data);
      return raw.map(fromApiClimateAlert);
    } catch {
      throw new Error('Não foi possível carregar os alertas críticos.');
    }
  },

  async resolveAlert(id: number): Promise<void> {
    try {
      await api.put(apiRoutes.alerts.resolve(id));
    } catch {
      throw new Error('Não foi possível resolver o alerta.');
    }
  },
};
