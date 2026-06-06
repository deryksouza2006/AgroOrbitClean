import { SensorReading } from '../types/SensorReading';
import api from './api';
import { apiRoutes } from '../constants/apiRoutes';
import { extractPageContent, fromApiSensorReading, toApiSensorReadingRequest } from '../utils/apiMappers';

export const sensorReadingService = {
  async getAll(): Promise<SensorReading[]> {
    try {
      const response = await api.get(apiRoutes.sensorReadings.list);
      const raw = extractPageContent<Record<string, unknown>>(response.data);
      return raw.map(fromApiSensorReading);
    } catch {
      throw new Error('Não foi possível carregar as leituras.');
    }
  },

  async getByCropArea(cropAreaId: number): Promise<SensorReading[]> {
    try {
      const response = await api.get(apiRoutes.sensorReadings.byCropArea(cropAreaId));
      const raw = extractPageContent<Record<string, unknown>>(response.data);
      return raw.map(fromApiSensorReading);
    } catch {
      throw new Error('Não foi possível carregar as leituras deste talhão.');
    }
  },

  async getBySensor(sensorId: number): Promise<SensorReading[]> {
    try {
      const response = await api.get(apiRoutes.sensorReadings.bySensor(sensorId));
      const raw = extractPageContent<Record<string, unknown>>(response.data);
      return raw.map(fromApiSensorReading);
    } catch {
      throw new Error('Não foi possível carregar as leituras deste sensor.');
    }
  },

  async create(data: Omit<SensorReading, 'id'>): Promise<SensorReading> {
    try {
      const payload = toApiSensorReadingRequest(data);
      const response = await api.post(apiRoutes.sensorReadings.list, payload);
      return fromApiSensorReading(response.data as Record<string, unknown>);
    } catch {
      throw new Error('Não foi possível registrar a leitura.');
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await api.delete(apiRoutes.sensorReadings.detail(id));
    } catch {
      throw new Error('Não foi possível excluir a leitura.');
    }
  },
};
