import { Sensor } from '../types/Sensor';
import api from './api';
import { apiRoutes } from '../constants/apiRoutes';
import { extractPageContent, fromApiSensor, toApiSensorRequest } from '../utils/apiMappers';

export const sensorService = {
  async getAll(): Promise<Sensor[]> {
    try {
      const response = await api.get(apiRoutes.sensors.list);
      const raw = extractPageContent<Record<string, unknown>>(response.data);
      return raw.map(fromApiSensor);
    } catch {
      throw new Error('Não foi possível carregar os sensores.');
    }
  },

  async getById(id: number): Promise<Sensor> {
    try {
      const response = await api.get(apiRoutes.sensors.detail(id));
      return fromApiSensor(response.data as Record<string, unknown>);
    } catch {
      throw new Error('Sensor não encontrado.');
    }
  },

  async getByCropArea(cropAreaId: number): Promise<Sensor[]> {
    try {
      const response = await api.get(apiRoutes.cropAreas.sensors(cropAreaId));
      const raw = extractPageContent<Record<string, unknown>>(response.data);
      return raw.map(fromApiSensor);
    } catch {
      throw new Error('Não foi possível carregar os sensores deste talhão.');
    }
  },

  async create(data: Omit<Sensor, 'id'>): Promise<Sensor> {
    try {
      const payload = toApiSensorRequest(data);
      const response = await api.post(apiRoutes.sensors.list, payload);
      return fromApiSensor(response.data as Record<string, unknown>);
    } catch {
      throw new Error('Não foi possível cadastrar o sensor.');
    }
  },

  async update(id: number, data: Partial<Sensor>): Promise<Sensor> {
    try {
      const payload = toApiSensorRequest(data as Omit<Sensor, 'id'>);
      const response = await api.put(apiRoutes.sensors.detail(id), payload);
      return fromApiSensor(response.data as Record<string, unknown>);
    } catch {
      throw new Error('Não foi possível atualizar o sensor.');
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await api.delete(apiRoutes.sensors.detail(id));
    } catch {
      throw new Error('Não foi possível excluir o sensor.');
    }
  },
};
