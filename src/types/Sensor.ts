export type SensorType = 'SOIL_MOISTURE' | 'TEMPERATURE' | 'AIR_HUMIDITY' | 'MULTI_SENSOR';
export type SensorStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'CRITICAL';

export interface Sensor {
  id: number;
  name: string;
  type: SensorType;
  status: SensorStatus;
  installedAt?: string;
  cropAreaId: number;
}
