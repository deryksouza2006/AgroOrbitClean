import { User } from '../types/User';
import { Farm, FarmStatus } from '../types/Farm';
import { CropArea, AreaUnit, CropAreaStatus, PolygonPoint } from '../types/CropArea';
import { Sensor, SensorType, SensorStatus } from '../types/Sensor';
import { SensorReading } from '../types/SensorReading';
import { SatelliteData } from '../types/SatelliteData';
import { Dashboard, NdviPoint } from '../types/Dashboard';
import { ClimateAlert, AlertType, AlertSeverity, AlertStatus } from '../types/ClimateAlert';
import { Recommendation, RecommendationPriority } from '../types/Recommendation';

/**
 * Extrai o conteúdo de uma resposta paginada da API Spring Boot.
 * Se a resposta tiver .content (Page), retorna content.
 * Se for um array direto, retorna ele.
 * Caso contrário, retorna [].
 */
export function extractPageContent<T>(data: unknown): T[] {
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.content)) {
      return obj.content as T[];
    }
  }
  if (Array.isArray(data)) {
    return data as T[];
  }
  return [];
}

const AREA_UNIT_TO_API: Record<string, string> = {
  ha: 'HA',
  m2: 'M2',
  acre: 'ACRE',
};

const AREA_UNIT_FROM_API: Record<string, AreaUnit> = {
  HA: 'ha',
  M2: 'm2',
  ACRE: 'acre',
};

export function toApiAreaUnit(unit: AreaUnit): string {
  return AREA_UNIT_TO_API[unit] ?? 'HA';
}

export function fromApiAreaUnit(unit: string): AreaUnit {
  return AREA_UNIT_FROM_API[unit] ?? 'ha';
}

const STATUS_TO_API: Record<string, string> = {
  HEALTHY: 'NORMAL',
  ATTENTION: 'ATTENTION',
  DROUGHT_RISK: 'DROUGHT_RISK',
  CRITICAL: 'CRITICAL',
};

const STATUS_FROM_API: Record<string, CropAreaStatus> = {
  NORMAL: 'HEALTHY',
  ATTENTION: 'ATTENTION',
  WARNING: 'ATTENTION',
  DROUGHT_RISK: 'DROUGHT_RISK',
  CRITICAL: 'CRITICAL',
};

export function toApiCropAreaStatus(status: CropAreaStatus): string {
  return STATUS_TO_API[status] ?? 'NORMAL';
}

export function fromApiCropAreaStatus(status: string): CropAreaStatus {
  return STATUS_FROM_API[status] ?? 'HEALTHY';
}

const SENSOR_TYPE_TO_API: Record<string, string> = {
  SOIL_MOISTURE: 'SOIL_MOISTURE',
  TEMPERATURE: 'TEMPERATURE',
  AIR_HUMIDITY: 'HUMIDITY',
  MULTI_SENSOR: 'WEATHER_STATION',
};

const SENSOR_TYPE_FROM_API: Record<string, SensorType> = {
  SOIL_MOISTURE: 'SOIL_MOISTURE',
  TEMPERATURE: 'TEMPERATURE',
  HUMIDITY: 'AIR_HUMIDITY',
  WEATHER_STATION: 'MULTI_SENSOR',
};

export function toApiSensorType(type: SensorType): string {
  return SENSOR_TYPE_TO_API[type] ?? 'SOIL_MOISTURE';
}

export function fromApiSensorType(type: string): SensorType {
  return SENSOR_TYPE_FROM_API[type] ?? 'SOIL_MOISTURE';
}

const SENSOR_STATUS_TO_API: Record<string, string> = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  MAINTENANCE: 'FAULT',
  CRITICAL: 'FAULT',
};

const SENSOR_STATUS_FROM_API: Record<string, SensorStatus> = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  FAULT: 'CRITICAL',
};

export function toApiSensorStatus(status: SensorStatus): string {
  return SENSOR_STATUS_TO_API[status] ?? 'ACTIVE';
}

export function fromApiSensorStatus(status: string): SensorStatus {
  return SENSOR_STATUS_FROM_API[status] ?? 'ACTIVE';
}

const ALERT_STATUS_FROM_API: Record<string, AlertStatus> = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_ANALYSIS',
  RESOLVED: 'RESOLVED',
  IGNORED: 'RESOLVED',
};

const ALERT_STATUS_TO_API: Record<string, string> = {
  OPEN: 'OPEN',
  IN_ANALYSIS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
};

const ALERT_TYPE_FROM_API: Record<string, AlertType> = {
  DROUGHT: 'DROUGHT_RISK',
  DROUGHT_RISK: 'DROUGHT_RISK',
  FIRE_RISK: 'FIRE_RISK',
  VEGETATION_STRESS: 'VEGETATIVE_STRESS',
  VEGETATIVE_STRESS: 'VEGETATIVE_STRESS',
  SENSOR_CRITICAL: 'CRITICAL_SENSOR',
  CRITICAL_SENSOR: 'CRITICAL_SENSOR',
};

const ALERT_SEVERITY_FROM_API: Record<string, AlertSeverity> = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

export function fromApiUser(data: Record<string, unknown>): User {
  const rawRole = ((data.role as string) ?? 'PRODUCER').replace('ROLE_', '');
  const role = (['PRODUCER', 'ADMIN', 'TECHNICIAN'].includes(rawRole) ? rawRole : 'PRODUCER') as User['role'];
  return {
    id: (data.id as number) ?? 0,
    name: (data.name as string) ?? '',
    email: (data.email as string) ?? '',
    phone: (data.phone as string) ?? undefined,
    role,
    createdAt: (data.createdAt as string) ?? undefined,
    lastAccessAt: (data.lastAccessAt as string) ?? undefined,
  };
}

export function fromApiFarm(data: Record<string, unknown>): Farm {
  const rawStatus = (data.status as string) ?? 'HEALTHY';
  const status = (['HEALTHY', 'ATTENTION', 'CRITICAL'].includes(rawStatus) ? rawStatus : 'HEALTHY') as FarmStatus;
  return {
    id: (data.id as number) ?? 0,
    name: (data.name as string) ?? '',
    responsibleName: (data.owner as string) ?? (data.responsibleName as string) ?? '',
    city: (data.city as string) ?? '',
    state: (data.state as string) ?? '',
    country: (data.country as string) ?? '',
    latitude: (data.latitude as number) ?? undefined,
    longitude: (data.longitude as number) ?? undefined,
    status,
    cropAreasCount: (data.cropAreasCount as number) ?? undefined,
    ownerId: (data.ownerId as number) ?? (data.userId as number) ?? undefined,
    userId: (data.userId as number) ?? (data.ownerId as number) ?? undefined,
  };
}

export function toApiFarmRequest(
  farm: Omit<Farm, 'id'>,
  userId: number,
): Record<string, unknown> {
  return {
    userId,
    name: farm.name,
    owner: farm.responsibleName ?? '',
    city: farm.city ?? '',
    state: farm.state ?? '',
    country: farm.country ?? 'Brasil',
  };
}

export function fromApiCropArea(data: Record<string, unknown>): CropArea {
  const location = data.location as Record<string, unknown> | undefined;
  const lat = (location?.latitude as number) ?? (data.latitude as number) ?? undefined;
  const lng = (location?.longitude as number) ?? (data.longitude as number) ?? undefined;

  return {
    id: (data.id as number) ?? 0,
    name: (data.name as string) ?? '',
    crop: (data.cropType as string) ?? (data.crop as string) ?? '',
    areaSize: (data.areaSize as number) ?? 0,
    areaUnit: fromApiAreaUnit((data.areaUnit as string) ?? 'HA'),
    latitude: lat,
    longitude: lng,
    description: (data.description as string) ?? undefined,
    farmId: (data.farmId as number) ?? 0,
    ndvi: (data.ndvi as number) ?? undefined,
    status: fromApiCropAreaStatus((data.status as string) ?? 'NORMAL'),
    lastReadingAt: (data.lastReadingAt as string) ?? undefined,
    polygonPoints: (data.polygonPoints as PolygonPoint[]) ?? undefined,
    boundaryGeoJson: (data.boundaryGeoJson as string) ?? undefined,
  };
}

export function toApiCropAreaRequest(
  area: Omit<CropArea, 'id'>,
): Record<string, unknown> {
  return {
    farmId: area.farmId,
    name: area.name,
    cropType: area.crop,
    areaSize: area.areaSize,
    areaUnit: toApiAreaUnit(area.areaUnit),
    latitude: area.latitude ?? null,
    longitude: area.longitude ?? null,
    boundaryGeoJson: area.boundaryGeoJson ?? null,
    status: toApiCropAreaStatus(area.status),
    description: area.description ?? null,
  };
}

export function fromApiSensor(data: Record<string, unknown>): Sensor {
  return {
    id: (data.id as number) ?? 0,
    name: (data.name as string) ?? '',
    type: fromApiSensorType((data.sensorType as string) ?? (data.type as string) ?? 'SOIL_MOISTURE'),
    status: fromApiSensorStatus((data.status as string) ?? 'ACTIVE'),
    cropAreaId: (data.cropAreaId as number) ?? 0,
    installedAt: (data.installationDate as string) ?? (data.installedAt as string) ?? undefined,
  };
}

export function toApiSensorRequest(
  sensor: Omit<Sensor, 'id'>,
): Record<string, unknown> {
  return {
    name: sensor.name,
    sensorType: toApiSensorType(sensor.type),
    status: toApiSensorStatus(sensor.status),
    cropAreaId: sensor.cropAreaId,
    installationDate: sensor.installedAt ?? null,
  };
}

export function fromApiSensorReading(data: Record<string, unknown>): SensorReading {
  return {
    id: (data.id as number) ?? 0,
    sensorId: (data.sensorId as number) ?? 0,
    temperature: (data.temperature as number) ?? undefined,
    airHumidity: (data.airHumidity as number) ?? (data.humidity as number) ?? undefined,
    soilMoisture: (data.soilHumidity as number) ?? (data.soilMoisture as number) ?? undefined,
    manualAlert: (data.manualAlert as boolean) ?? undefined,
    readingDate: (data.readingDate as string) ?? (data.readAt as string) ?? (data.timestamp as string) ?? '',
  };
}

export function toApiSensorReadingRequest(
  reading: Omit<SensorReading, 'id'>,
): Record<string, unknown> {
  return {
    sensorId: reading.sensorId,
    temperature: reading.temperature ?? null,
    airHumidity: reading.airHumidity ?? null,
    soilHumidity: reading.soilMoisture ?? null,
    manualAlert: reading.manualAlert ?? false,
    readingDate: reading.readingDate,
  };
}

export function fromApiSatelliteData(data: Record<string, unknown>): SatelliteData {
  return {
    id: (data.id as number) ?? 0,
    cropAreaId: (data.cropAreaId as number) ?? 0,
    source: (data.source as string) ?? undefined,
    ndviMean: (data.ndviAverage as number) ?? (data.ndviMean as number) ?? 0,
    ndviMin: (data.ndviMin as number) ?? undefined,
    ndviMax: (data.ndviMax as number) ?? undefined,
    surfaceTemperature: (data.surfaceTemperature as number) ?? undefined,
    cloudCoverage: (data.cloudCoverage as number) ?? undefined,
    capturedAt: (data.captureDate as string) ?? (data.capturedAt as string) ?? '',
  };
}

export function toApiSatelliteDataRequest(
  sat: Omit<SatelliteData, 'id'>,
): Record<string, unknown> {
  return {
    cropAreaId: sat.cropAreaId,
    source: sat.source ?? 'SENTINEL_HUB_STATISTICAL_API',
    ndviAverage: sat.ndviMean,
    ndviMin: sat.ndviMin ?? null,
    ndviMax: sat.ndviMax ?? null,
    surfaceTemperature: sat.surfaceTemperature ?? null,
    cloudCoverage: sat.cloudCoverage ?? null,
    captureDate: sat.capturedAt,
  };
}

export function fromApiDashboard(data: Record<string, unknown>): Dashboard {
  const history = Array.isArray(data.ndviHistory)
    ? (data.ndviHistory as Array<Record<string, unknown>>).map(
        (p): NdviPoint => ({
          label: (p.label as string) ?? '',
          value: (p.value as number) ?? 0,
        }),
      )
    : [];

  const recentAlerts = Array.isArray(data.recentAlerts)
    ? (data.recentAlerts as Array<Record<string, unknown>>).map((a) => ({
        id: (a.id as number) ?? 0,
        title: (a.title as string) ?? '',
        severity: (a.severity as string) ?? 'LOW',
        createdAt: (a.createdAt as string) ?? '',
      }))
    : [];

  const criticalAreas = Array.isArray(data.criticalCropAreas)
    ? (data.criticalCropAreas as Array<Record<string, unknown>>).map((c) => ({
        id: (c.id as number) ?? 0,
        name: (c.name as string) ?? '',
        status: (c.status as string) ?? 'NORMAL',
        ndvi: (c.ndvi as number) ?? undefined,
      }))
    : [];

  const criticalFromApi = Array.isArray(data.areasInRisk)
    ? (data.areasInRisk as Array<Record<string, unknown>>).map((c) => ({
        id: (c.id as number) ?? 0,
        name: (c.name as string) ?? '',
        status: (c.status as string) ?? 'NORMAL',
        ndvi: (c.ndvi as number) ?? undefined,
      }))
    : criticalAreas;

  return {
    farmsCount: (data.farmsCount as number) ?? (data.totalFarms as number) ?? 0,
    cropAreasCount: (data.cropAreasCount as number) ?? (data.totalCropAreas as number) ?? 0,
    activeSensors: (data.activeSensors as number) ?? (data.totalSensors as number) ?? 0,
    openAlerts: (data.openAlerts as number) ?? 0,
    avgNdvi: (data.avgNdvi as number) ?? (data.averageNdvi as number) ?? 0,
    generalStatus: (data.generalStatus as string) ?? 'Sem dados',
    ndviHistory: history,
    recentAlerts,
    criticalCropAreas: criticalFromApi,
  };
}

export function fromApiClimateAlert(data: Record<string, unknown>): ClimateAlert {
  const rawType = (data.alertType as string) ?? (data.type as string) ?? '';
  const mappedType: AlertType = ALERT_TYPE_FROM_API[rawType] ?? 'DROUGHT_RISK';
  const cropArea = data.cropArea as Record<string, unknown> | undefined;
  const cropAreaResponse = data.cropAreaResponse as Record<string, unknown> | undefined;

  return {
    id: (data.id as number) ?? 0,
    title: (data.title as string) ?? '',
    description: (data.description as string) ?? (data.message as string) ?? undefined,
    type: mappedType,
    severity: ALERT_SEVERITY_FROM_API[(data.severity as string) ?? ''] ?? 'LOW',
    status: ALERT_STATUS_FROM_API[(data.status as string) ?? ''] ?? 'OPEN',
    cropAreaId:
      (data.cropAreaId as number) ??
      (cropArea?.id as number) ??
      (cropAreaResponse?.id as number) ??
      undefined,
    createdAt: (data.createdAt as string) ?? '',
  };
}

export function fromApiRecommendation(data: Record<string, unknown>): Recommendation {
  const rawPriority = (data.priority as string) ?? 'MEDIUM';
  const priority = (['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(rawPriority) ? rawPriority : 'MEDIUM') as RecommendationPriority;
  const alert = data.alert as Record<string, unknown> | undefined;
  const alertCropArea = alert?.cropArea as Record<string, unknown> | undefined;

  return {
    id: (data.id as number) ?? 0,
    title: (data.title as string) || 'Recomendação de manejo',
    description: (data.message as string) ?? (data.description as string) ?? undefined,
    priority,
    completed: false, // API não possui campo de completed
    relatedAlertId:
      (data.relatedAlertId as number) ??
      (data.alertId as number) ??
      (alert?.id as number) ??
      undefined,
    cropAreaId:
      (data.cropAreaId as number) ??
      (alert?.cropAreaId as number) ??
      (alertCropArea?.id as number) ??
      undefined,
  };
}
